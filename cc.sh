export FABRIC_CFG_PATH=$(pwd)/sampleconfig
CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode $1 -o 127.0.0.1:7050 -C ch1 -n mycc -c '{"Args":['$2']}'