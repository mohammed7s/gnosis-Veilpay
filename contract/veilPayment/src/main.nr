//mod config;
//mod utils;

use dep::aztec::macros::aztec;

#[aztec]
pub contract VeilPayment {
    use dep::aztec::{
        macros::{ functions::{initializer, private}, storage::storage },
        messages::logs::note::encode_and_encrypt_note,
    };

    use dep::aztec::prelude::{AztecAddress, PrivateImmutable, PublicMutable, Map};
    use dep::address_note::address_note::AddressNote;
    use dep::token::Token;
    use aztec::protocol_types::storage;

    global CLAWBACK_DELAY: u64 = 180; // 3 minutes in seconds

    #[storage]
    struct Storage<Context> {
        depositer: PrivateImmutable<AddressNote, Context>,
        issuer: PrivateImmutable<AddressNote, Context>,

        // Map to store clawback requests
        clawback_request: Map<Field, PublicMutable<u64, Context>, Context>,        
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
    fn clawback(token: AztecAddress, amount: u128) {
        let sender = context.msg_sender();

        let note = storage.issuer.get_note();
        assert(note.address == sender);

        // docs:start:call_function
        Token::at(token)
            .transfer_in_private(sender, context.this_address(), amount, 1)
            .call(&mut context);
        // docs:end:call_function
    }

    #[private]
    fn initialiateClawback(
        token: AztecAddress,
        amount: u128,
        recipient: AztecAddress,
        nonce: Field
    ) ->  Field {
        let sender = context.msg_sender();
        let issuer_note = storage.issuer.get_note();
        assert(issuer_note.address == sender, "Only issuer can initiate clawback");
        //call claimClawback(token, amount, recipient, nonce);
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

        // Reproduce the hash from the nonce, amount, and recipient
        /*
        let clawback_hash = poseidon2_hash(
            [
                nonce,
                amount as Field,
                recipient.to_field(),
                Field::from(amount), recipient],
                0 // Use a specific generator index for clawback hash
            ]
        );
        */

        // Check if the clawback request exists and is old enough
        //let request_time = storage.clawback_request.at(clawback_hash).read();
        //assert(request_time > 0 && context.block_timestamp() - request_time >= CLAWBACK_DELAY, 
        //    "Clawback request is either non-existent or too recent");

        // Transfer the amount to the recipient
        //Token::at(token).transfer(recipient, amount).call(&mut context);
    }   //

    //    #[public]
    //     pub fn store_clawback_request(context: Context, clawback_hash: Field) {
    //         let currrent_time = context.block_timestamp();
    //         // Store the clawback request with the current timestamp
    //         storage.clawback_request.at(clawback_hash).write(currrent_time);
    //     }
å
    // user interacts with two functions, 
        // i want to withdraw
        // priv initialiateClawback()
            // the private func, creates a hash of nounce , amount and recipient
            // encues to the public function that will put the hash in storage ( with the current timestamp)
            // now the user can claim it 

     
        //priv claimClawback() {
            //public
                // reproduce the hash, enqueues the public function, 
                // asserts if is old enough (e.g. 3 min) 
                // check if the hash is in storage
                // if it is, send the amount to the recipient
                // if not, then we return an error
}



#[test]
fn test_main() {
    // Uncomment to make test fail
    // VeilPayment::main(1, 1);
} 