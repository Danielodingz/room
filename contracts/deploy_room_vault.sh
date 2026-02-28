#!/bin/bash
# deploy_room_vault.sh
# Run this after funding the deployer account with Sepolia ETH
# Deployer address: 0x0299ec519b5305c95d94c4d6442e493e4665fbab7313157bc22501824e4de565
# Fund at: https://faucet.starknet.io/

set -e

STARKLI="$HOME/.starkli/bin/starkli"
KEYSTORE="$(dirname "$0")/.starkli/deployer_key.json"
ACCOUNT="$(dirname "$0")/.starkli/deployer_account.json"
CONTRACT="$(dirname "$0")/room_vault/target/dev/room_vault_RoomVault.contract_class.json"
RPC="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"

echo "🔑 Using deployer: 0x0299ec519b5305c95d94c4d6442e493e4665fbab7313157bc22501824e4de565"
echo "📡 RPC: $RPC"
echo ""

# Step 1: Deploy the account if not already deployed
echo "Step 1: Deploying account..."
printf 'deployerPass123\n' | $STARKLI account deploy $ACCOUNT \
  --keystore $KEYSTORE \
  --rpc $RPC \
  --max-fee 0.01 || echo "Account may already be deployed, continuing..."

echo ""
echo "Step 2: Declaring contract..."
CLASS_HASH=$(printf 'deployerPass123\n' | $STARKLI declare $CONTRACT \
  --keystore $KEYSTORE \
  --account $ACCOUNT \
  --rpc $RPC \
  --max-fee 0.01 2>&1 | grep "Class hash declared:" | awk '{print $NF}')

echo "✅ Class hash: $CLASS_HASH"
echo ""

echo "Step 3: Deploying contract..."
CONTRACT_ADDR=$(printf 'deployerPass123\n' | $STARKLI deploy $CLASS_HASH \
  --keystore $KEYSTORE \
  --account $ACCOUNT \
  --rpc $RPC \
  --max-fee 0.01 2>&1 | grep "Contract deployed:" | awk '{print $NF}')

echo ""
echo "============================================="
echo "✅ RoomVault deployed!"
echo "Contract address: $CONTRACT_ADDR"
echo "============================================="
echo ""
echo "Now update ROOM_VAULT_CONTRACT in:"
echo "  src/lib/roomVault.ts"
echo "Replace PLACEHOLDER_ROOM_VAULT_ADDRESS with: $CONTRACT_ADDR"
