use starknet::ContractAddress;

#[starknet::interface]
pub trait IRoomVault<TState> {
    fn deposit(ref self: TState, amount: u256);
    fn withdraw(ref self: TState, amount: u256, to: ContractAddress);
    fn transfer_in_room(ref self: TState, to: ContractAddress, amount: u256);
    fn get_balance(self: @TState, account: ContractAddress) -> u256;
}

#[starknet::interface]
pub trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
    fn balance_of(self: @TState, account: ContractAddress) -> u256;
}

#[starknet::contract]
mod RoomVault {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use super::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess, StorageMapWriteAccess
    };

    #[storage]
    struct Storage {
        strk_token: ContractAddress,
        balances: LegacyMap<ContractAddress, u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, strk_token: ContractAddress) {
        self.strk_token.write(strk_token);
    }

    #[abi(embed_v0)]
    impl RoomVaultImpl of super::IRoomVault<ContractState> {
        fn deposit(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let vault_address = get_contract_address();
            let strk = IERC20Dispatcher { contract_address: self.strk_token.read() };

            // Transfer STRK from user to vault
            strk.transfer_from(caller, vault_address, amount);

            // Update internal balance
            let current_balance = self.balances.read(caller);
            self.balances.write(caller, current_balance + amount);
        }

        fn withdraw(ref self: ContractState, amount: u256, to: ContractAddress) {
            let caller = get_caller_address();
            let current_balance = self.balances.read(caller);
            assert(current_balance >= amount, 'Insufficient balance');

            // Update internal balance
            self.balances.write(caller, current_balance - amount);

            // Transfer STRK from vault to target
            let strk = IERC20Dispatcher { contract_address: self.strk_token.read() };
            strk.transfer(to, amount);
        }

        fn transfer_in_room(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let current_balance = self.balances.read(caller);
            assert(current_balance >= amount, 'Insufficient balance');

            // Update balances
            self.balances.write(caller, current_balance - amount);
            let recipient_balance = self.balances.read(to);
            self.balances.write(to, recipient_balance + amount);
        }

        fn get_balance(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }
    }
}
