#!/bin/bash
# deploy_room_vault.sh — fixed for starkli 0.4.2
# 
# BEFORE RUNNING:
# Send 0.01+ STRK to this address from your Argent wallet (Sepolia):
#   0x0299ec519b5305c95d94c4d6442e493e4665fbab7313157bc22501824e4de565
#
# THEN run:  bash contracts/deploy_room_vault.sh

set -e

STARKLI="$HOME/.starkli/bin/starkli"
KEYSTORE="$(cd "$(dirname "$0")" && pwd)/.starkli/deployer_key.json"
ACCOUNT="$(cd "$(dirname "$0")" && pwd)/.starkli/deployer_account.json"
CONTRACT="$(cd "$(dirname "$0")" && pwd)/room_vault/target/dev/room_vault_RoomVault.contract_class.json"
RPC="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"
DEPLOYER="0x0299ec519b5305c95d94c4d6442e493e4665fbab7313157bc22501824e4de565"
PASS="deployerPass123"

echo "🔑 Deployer: $DEPLOYER"
echo "📡 RPC: $RPC"
echo ""

# Check balance first
echo "Checking deployer balance..."
BAL=$(printf '%s\n' "$PASS" | STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI balance "$DEPLOYER" --rpc "$RPC" 2>&1 || echo "0")
echo "Balance: $BAL"
if [[ "$BAL" == "0.000000000000000000" ]]; then
  echo ""
  echo "❌ Deployer has 0 STRK. Please send 0.02+ STRK from your Argent wallet to:"
  echo "   $DEPLOYER"
  echo ""
  echo "Then run this script again."
  exit 1
fi

# Step 1: Deploy the account contract
echo ""
echo "Step 1: Deploying account..."
STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI account deploy "$ACCOUNT" \
  --keystore "$KEYSTORE" \
  --rpc "$RPC" \
  --strk 2>&1 || echo "Note: account may already be deployed, continuing..."

# Step 2: Declare the contract
echo ""
echo "Step 2: Declaring contract..."
DECLARE_OUT=$(STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI declare "$CONTRACT" \
  --keystore "$KEYSTORE" \
  --account "$ACCOUNT" \
  --rpc "$RPC" \
  --strk 2>&1)
echo "$DECLARE_OUT"
CLASS_HASH=$(echo "$DECLARE_OUT" | grep -oE '0x[0-9a-f]+' | head -1)
echo "✅ Class hash: $CLASS_HASH"

# Step 3: Deploy the contract instance
echo ""
echo "Step 3: Deploying contract..."
DEPLOY_OUT=$(STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI deploy "$CLASS_HASH" \
  --keystore "$KEYSTORE" \
  --account "$ACCOUNT" \
  --rpc "$RPC" \
  --strk 2>&1)
echo "$DEPLOY_OUT"
CONTRACT_ADDR=$(echo "$DEPLOY_OUT" | grep -oE '0x[0-9a-f]{60,}' | tail -1)

echo ""
echo "============================================="
echo "✅ RoomVault deployed!"
echo "Contract address: $CONTRACT_ADDR"
echo "============================================="
echo ""
echo "Now update src/lib/roomVault.ts line 7:"
echo "  Change: \"PLACEHOLDER_ROOM_VAULT_ADDRESS\""
echo "  To:     \"$CONTRACT_ADDR\""
