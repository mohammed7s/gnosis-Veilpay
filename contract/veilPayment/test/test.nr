use crate::veilPayment;
use aztec::macros::aztec;

use aztec::{
    macros::functions::{initializer, private},
    messages::logs::note::encode_and_encrypt_note,
    prelude::{AztecAddress, PrivateImmutable},
    token::Token,
}