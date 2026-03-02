#!/bin/bash
# deploy_room_vault.sh — using public RPC
set -e

STARKLI="$HOME/.starkli/bin/starkli"
KEYSTORE="$(cd "$(dirname "$0")" && pwd)/.starkli/deployer_key.json"
ACCOUNT="$(cd "$(dirname "$0")" && pwd)/.starkli/deployer_account.json"
CONTRACT="$(cd "$(dirname "$0")" && pwd)/room_vault/target/dev/room_vault_RoomVault.contract_class.json"
# Using an Alchemy RPC to fix the JsonRpcResponse error (Blast API is defunct)
RPC="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo"
DEPLOYER="0x0299ec519b5305c95d94c4d6442e493e4665fbab7313157bc22501824e4de565"
PASS="deployerPass123"

echo "🔑 Deployer: $DEPLOYER"
echo "📡 RPC: $RPC"
echo ""

# Step 2: Declare the contract
echo "Step 2: Declaring contract..."
CASM_FILE="$(cd "$(dirname "$0")" && pwd)/room_vault/target/dev/room_vault_RoomVault.compiled_contract_class.json"
DECLARE_OUT=$(STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI declare "$CONTRACT" \
  --keystore "$KEYSTORE" \
  --account "$ACCOUNT" \
  --rpc "$RPC" \
  --casm-hash 0x234b97af80a96a06b38f21f1f9aa4b6a7eb020a7dc71d848636f7e84117db21 2>&1)
echo "$DECLARE_OUT"
CLASS_HASH=$(echo "$DECLARE_OUT" | grep "Class hash declared:" | awk '{print $NF}')

if [[ -z "$CLASS_HASH" ]]; then
  # Try to extract from error if it's already declared
  CLASS_HASH=$(echo "$DECLARE_OUT" | grep -oE '0x[0-9a-f]{64}' | head -1)
fi
echo "✅ Class hash: $CLASS_HASH"

# Step 3: Deploy the contract instance
echo "Step 3: Deploying contract..."
# Provide the STRK address for the constructor
STRK="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
DEPLOY_OUT=$(STARKNET_KEYSTORE_PASSWORD="$PASS" $STARKLI deploy "$CLASS_HASH" "$STRK" \
  --keystore "$KEYSTORE" \
  --account "$ACCOUNT" \
  --rpc "$RPC" 2>&1)
echo "$DEPLOY_OUT"
CONTRACT_ADDR=$(echo "$DEPLOY_OUT" | grep "Contract deployed:" | awk '{print $NF}')

echo ""
echo "============================================="
echo "✅ RoomVault deployed!"
echo "Contract address: $CONTRACT_ADDR"
echo "============================================="
