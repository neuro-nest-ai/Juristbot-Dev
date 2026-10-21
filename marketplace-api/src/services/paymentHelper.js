// Payment/escrow abstraction stub.
// Phase 1 does not process payments. Real implementation (Razorpay) lands in Phase 3.
// Keep all payment logic behind this interface so the escrow provider can be swapped
// without touching controllers.

async function createEscrowOrder(/* { amountPaise, receipt, notes } */) {
  throw new Error('paymentHelper.createEscrowOrder not implemented until Phase 3');
}

async function verifyEscrowPayment(/* { razorpayOrderId, razorpayPaymentId, signature } */) {
  throw new Error('paymentHelper.verifyEscrowPayment not implemented until Phase 3');
}

async function releaseEscrow(/* { orderId, amountPaise } */) {
  throw new Error('paymentHelper.releaseEscrow not implemented until Phase 3');
}

async function refundEscrow(/* { orderId, amountPaise } */) {
  throw new Error('paymentHelper.refundEscrow not implemented until Phase 3');
}

module.exports = { createEscrowOrder, verifyEscrowPayment, releaseEscrow, refundEscrow };
