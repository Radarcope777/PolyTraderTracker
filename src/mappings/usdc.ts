import { BigDecimal, BigInt, Address, log } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from '../types/USDC/ERC20'
import { User, Transfer } from '../types/schema'
import { createOrLoadUser } from '../utils/helpers'
import { convertTokenToDecimal } from '../utils/math'
import { USDC_DECIMALS, TRANSFER_TYPE_DEPOSIT, TRANSFER_TYPE_WITHDRAWAL } from '../utils/constants'

// Polymarket contract addresses
const POLYMARKET_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
const POLYMARKET_CONDITIONAL_TOKENS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045'

export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from.toHexString()
  const to = event.params.to.toHexString()
  const value = convertTokenToDecimal(event.params.value, USDC_DECIMALS)
  const timestamp = event.block.timestamp
  const blockNumber = event.block.number
  const txHash = event.transaction.hash.toHexString()
  const logIndex = event.logIndex.toString()
  const transferId = txHash + '-' + logIndex

  // Track USDC transfers to/from Polymarket contracts
  if (from != POLYMARKET_EXCHANGE && from != POLYMARKET_CONDITIONAL_TOKENS && 
      to != POLYMARKET_EXCHANGE && to != POLYMARKET_CONDITIONAL_TOKENS) {
    return // Skip transfers that don't involve Polymarket contracts
  }

  // Determine if this is a deposit (user to protocol) or withdrawal (protocol to user)
  let userAddress: string
  let transferType: string

  if (from != POLYMARKET_EXCHANGE && from != POLYMARKET_CONDITIONAL_TOKENS) {
    // User is sending USDC to Polymarket (deposit)
    userAddress = from
    transferType = TRANSFER_TYPE_DEPOSIT
  } else if (to != POLYMARKET_EXCHANGE && to != POLYMARKET_CONDITIONAL_TOKENS) {
    // Polymarket is sending USDC to user (withdrawal)
    userAddress = to
    transferType = TRANSFER_TYPE_WITHDRAWAL
  } else {
    // This is an internal transfer between Polymarket contracts, skip it
    return
  }

  // Load or create user
  const user = createOrLoadUser(userAddress)
  
  // Create transfer entity
  const transfer = new Transfer(transferId)
  transfer.user = user.id
  transfer.timestamp = timestamp
  transfer.blockNumber = blockNumber
  transfer.transactionHash = txHash
  transfer.tokenAddress = event.address.toHexString()
  transfer.from = from
  transfer.to = to
  transfer.amount = value
  transfer.type = transferType
  transfer.save()
}
