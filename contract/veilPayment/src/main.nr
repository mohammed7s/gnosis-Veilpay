//mod config;
//mod utils;

use dep::aztec::macros::aztec;

#[aztec]
pub contract VeilPayment {
    use dep::aztec::{
        macros::{ functions::{initializer, private}, storage::storage },
        messages::logs::note::encode_and_encrypt_note,
    };

    use dep::aztec::prelude::{AztecAddress, PrivateImmutable};

    // docs:start:addressnote_import
    use dep::address_note::address_note::AddressNote;
    // docs:end:addressnote_import
    use dep::token::Token;

    #[storage]
    struct Storage<Context> {
        depositer: PrivateImmutable<AddressNote, Context>,
        issuer: PrivateImmutable<AddressNote, Context>,
       // key: PrivateImmutable<AztecAddress, Context>,
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
        assert(note.address == sender);
        // docs:start:call_function
        Token::at(token).transfer(recipient, amount).call(&mut context);
        // docs:end:call_function
    }

}

#[test]
fn test_main() {
    // Uncomment to make test fail
    // VeilPayment::main(1, 1);
} 