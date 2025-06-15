//mod config;
//mod utils;

use dep::aztec::macros::aztec;

#[aztec]
pub contract VeilPayment {
    use dep::aztec::{
        macros::{ functions::{initializer, private, public}, storage::storage },
        messages::logs::note::encode_and_encrypt_note,
    };
    use dep::aztec::prelude::{AztecAddress, PrivateImmutable, PublicImmutable, Map};
    use dep::address_note::address_note::AddressNote;
    use dep::token::Token;
    use aztec::protocol_types::{storage, traits::ToField};
    use poseidon::poseidon2;

    global CLAWBACK_DELAY: u64 = 180; // 3 minutes in seconds

    #[storage]
    struct Storage<Context> {
      
        depositer: PrivateImmutable<AddressNote, Context>,
        issuer: PrivateImmutable<AddressNote, Context>,

        // Map to store clawback requests
        clawback_request: Map<Field, PublicImmutable<u64, Context>, Context>,       
        key: PrivateImmutable<Field, Context>,
        
    }

    // Creates a new instance
    #[private]
    #[initializer]
    fn constructor(depositer: AztecAddress, issuer: AztecAddress) {
        // docs:start:addressnote_new
        let note = AddressNote::new(depositer, depositer);
        let note_issuer = AddressNote::new(issuer, issuer);
        // docs:end:addressnote_new
        storage.depositer.initialize(note).emit(encode_and_encrypt_note(
            &mut context,
            depositer,
            context.msg_sender(),
        ));
        storage.issuer.initialize(note_issuer).emit(encode_and_encrypt_note(
            &mut context,
            issuer,
            context.msg_sender(),
        ));
    }

    // Withdraws balance. Requires that msg.sender is the depositer.
    #[private]
    fn withdraw(token: AztecAddress, amount: u128, recipient: AztecAddress) {
        let sender = context.msg_sender();
        let note = storage.depositer.get_note();
        assert(note.address == sender, "Only the depositer can withdraw");
        
        Token::at(token).transfer(recipient, amount).call(&mut context);
    }
    
    #[private]
    fn deposit(token: AztecAddress, recipient: AztecAddress, amount: u128) {
        let sender = context.msg_sender();
        let note = storage.depositer.get_note();
        assert(note.address == sender);

        // docs:start:call_function
        Token::at(token).transfer_in_private(
            sender,
            context.this_address(),
            amount,
             1 )
            .call(&mut context);
    }

    #[private]
    fn initialiateClawback(
        token: AztecAddress,
        amount: u128,
        recipient: AztecAddress,
        nonce: Field
    ) {
        let sender = context.msg_sender();
        let issuer_note = storage.issuer.get_note();
        assert(issuer_note.address == sender, "Only issuer can initiate clawback");
        let clawback_hash = poseidon2::Poseidon2::hash([token.to_field(),recipient.to_field(), amount as Field, nonce], 4);
        VeilPayment::at(context.this_address()).registerClawback(clawback_hash).enqueue(&mut context);
    }

    #[public]
    fn registerClawback(
        clawback_hash:Field
    ) {
        storage.clawback_request.at(clawback_hash).initialize(context.timestamp());
    }

    #[public]
    fn checkClawbackAge(
        clawback_hash:Field,
        min_age: u64
    ) {
        let clawback_time = storage.clawback_request.at(clawback_hash).read();
        let current_time = context.timestamp();
        let clawback_valid_age = clawback_time + min_age; 
        assert(current_time >= clawback_valid_age, "Clawback request is too recent");
    }

    #[private]
    fn claimClawback(
        token: AztecAddress,
        amount: u128,
        recipient: AztecAddress,
        nonce: Field
    ) {
        let sender = context.msg_sender();
        let depositer_note = storage.depositer.get_note();
        assert(depositer_note.address == sender, "Only depositer can claim clawback");
    
        let clawback_hash = poseidon2::Poseidon2::hash([token.to_field(),recipient.to_field(), amount as Field, nonce], 4);

        // Check if the clawback request exists and is old enough
        VeilPayment::at(context.this_address()).checkClawbackAge(clawback_hash, CLAWBACK_DELAY ).enqueue(&mut context);
        
        // Transfer the amount to the recipient
        Token::at(token).transfer_in_private(context.this_address(), recipient, amount, nonce).call(&mut context);
    }
}