use starknet::ContractAddress;
use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess, Map};

/// Minimal ERC-20 interface needed by RoomVault
#[starknet::interface]
trait IERC20<TState> {
    fn transfer(ref self: TState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState, sender: ContractAddress, recipient: ContractAddress, amount: u256
    ) -> bool;
}

#[starknet::interface]
pub trait IRoomVault<TContractState> {
    fn deposit(ref self: TContractState, amount: u256);
    fn withdraw(ref self: TContractState, amount: u256, to: ContractAddress);
    fn transfer_in_room(ref self: TContractState, to: ContractAddress, amount: u256);
    fn get_balance(self: @TContractState, account: ContractAddress) -> u256;
}

#[starknet::contract]
mod RoomVault {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess, Map};
    use super::IERC20DispatcherTrait;
    use super::IERC20Dispatcher;

    // STRK token — same address on Starknet Sepolia and Mainnet
    const STRK_ADDRESS: felt252 =
        0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposited: Deposited,
        Withdrawn: Withdrawn,
        RoomTransfer: RoomTransfer,
    }

    #[derive(Drop, starknet::Event)]
    struct Deposited {
        #[key] caller: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Withdrawn {
        #[key] caller: ContractAddress,
        #[key] to: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RoomTransfer {
        #[key] from: ContractAddress,
        #[key] to: ContractAddress,
        amount: u256,
    }

    fn strk_token() -> IERC20Dispatcher {
        let addr: ContractAddress = STRK_ADDRESS.try_into().unwrap();
        IERC20Dispatcher { contract_address: addr }
    }

    #[abi(embed_v0)]
    impl RoomVaultImpl of super::IRoomVault<ContractState> {
        /// Fund your Room Wallet.
        /// Required: first call STRK.approve(vault_address, amount) from your wallet.
        fn deposit(ref self: ContractState, amount: u256) {
            assert(amount > 0, 'Amount must be > 0');
            let caller = get_caller_address();
            let vault = get_contract_address();
            let ok = strk_token().transfer_from(caller, vault, amount);
            assert(ok, 'STRK transferFrom failed');
            self.balances.write(caller, self.balances.read(caller) + amount);
            self.emit(Deposited { caller, amount });
        }

        /// Withdraw STRK from Room Wallet to your Argent/Braavos wallet.
        fn withdraw(ref self: ContractState, amount: u256, to: ContractAddress) {
            assert(amount > 0, 'Amount must be > 0');
            let caller = get_caller_address();
            let bal = self.balances.read(caller);
            assert(bal >= amount, 'Insufficient balance');
            self.balances.write(caller, bal - amount);
            let ok = strk_token().transfer(to, amount);
            assert(ok, 'STRK transfer failed');
            self.emit(Withdrawn { caller, to, amount });
        }

        /// Send STRK to another Room participant during a meeting.
        /// Pure internal accounting — no token movement, cheaper gas.
        fn transfer_in_room(ref self: ContractState, to: ContractAddress, amount: u256) {
            assert(amount > 0, 'Amount must be > 0');
            let caller = get_caller_address();
            assert(caller != to, 'Cannot send to self');
            let from_bal = self.balances.read(caller);
            assert(from_bal >= amount, 'Insufficient balance');
            self.balances.write(caller, from_bal - amount);
            self.balances.write(to, self.balances.read(to) + amount);
            self.emit(RoomTransfer { from: caller, to, amount });
        }

        /// Read the Room Wallet balance for any address.
        fn get_balance(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }
    }
}
