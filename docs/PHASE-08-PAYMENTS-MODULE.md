# Phase 8: Payments Module (VNPay Integration)

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [VNPay Integration](#vnpay-integration)
3. [Payment Flow](#payment-flow)
4. [API Endpoints](#api-endpoints)
5. [Environment Variables](#environment-variables)

---

## Tổng Quan

Module Payments tích hợp thanh toán qua VNPay cho việc đặt sân. Hỗ trợ:

- Tạo URL thanh toán VNPay
- Xử lý callback từ VNPay
- Hoàn tiền (refund)
- Quản lý payment history

---

## VNPay Integration

### Configuration

```env
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=http://localhost:3000/api/v1/payments/vnpay/return
```

### Payment URL Generation

```typescript
// Tạo URL thanh toán
const paymentUrl = await paymentsService.createPaymentUrl(userId, {
  bookingId: 'uuid-của-booking',
  paymentMethod: PaymentMethod.VNPAY,
  paymentType: PaymentType.DEPOSIT, // hoặc FULL
});
```

### VNPay Parameters

| Parameter | Mô tả |
|-----------|--------|
| `vnp_Version` | Phiên bản API (2.1.0) |
| `vnp_Command` | Lệnh (pay) |
| `vnp_TmnCode` | Mã terminal từ VNPay |
| `vnp_Amount` | Số tiền (VND × 100) |
| `vnp_TxnRef` | Mã giao dịch (payment ID) |
| `vnp_OrderInfo` | Thông tin đơn hàng |
| `vnp_ReturnUrl` | URL callback |
| `vnp_IpAddr` | IP người thanh toán |
| `vnp_CreateDate` | Ngày tạo (yyyyMMddHHmmss) |
| `vnp_Locale` | Ngôn ngữ (vn) |
| `vnp_CurrCode` | Mã tiền tệ (VND) |

---

## Payment Flow

```
┌─────────────┐
│ Tạo Payment │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Tạo Payment URL │
│ (VNPay)         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Redirect User   │
│ to VNPay        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ VNPay processes │
│ payment         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ VNPay returns   │
│ to callback URL │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Update payment  │
│ status          │
└─────────────────┘
```

### Response Codes

| Code | Mô tả |
|------|--------|
| `00` | Giao dịch thành công |
| `07` | Tran đang xử lý |
| `09` | Thẻ không tồn tại |
| `10` | Sai mật khẩu (3 lần) |
| `11` | Thẻ hết hạn |
| `12` | Sai định dạng |
| `13` | Tài khoản bị khóa |
| `24` | Hủy giao dịch |
| `51` | Không đủ số dư |
| `65` | Vượt hạn mức ngày |
| `75` | Ngân hàng đang bảo trì |
| `99` | Lỗi khác |

---

## API Endpoints

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/create` | Tạo URL thanh toán | User |
| GET | `/payments/vnpay/return` | VNPay callback | None |
| GET | `/payments` | Danh sách payments | Admin |
| GET | `/payments/booking/:bookingId` | Payments của booking | User |
| GET | `/payments/:id` | Chi tiết payment | User |
| POST | `/payments/:id/refund` | Hoàn tiền | Admin |
| POST | `/payments/:id/cancel` | Hủy payment | User |

### Create Payment Request

```bash
POST /api/v1/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid-của-booking",
  "paymentMethod": "vnpay",
  "paymentType": "deposit"
}
```

### Response

```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "txnRef": "uuid-của-payment"
}
```

### VNPay Return Handling

```typescript
// GET /payments/vnpay/return
// Query params: vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, ...

const result = await paymentsService.handleVNPayReturn({
  vnp_ResponseCode: '00',
  vnp_TransactionStatus: '00',
  vnp_TxnRef: 'uuid-của-payment',
  // ...
});
```

---

## Environment Variables

Thêm vào file `.env`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=http://localhost:3000/api/v1/payments/vnpay/return

# Production URLs
# VNPAY_URL=https://pay.vnpayment.vn
# VNPAY_RETURN_URL=https://your-domain.com/api/v1/payments/vnpay/return
```

---

## Error Handling

### Common Errors

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| `Booking không tồn tại` | 404 | Booking ID không hợp lệ |
| `Bạn không có quyền thanh toán` | 403 | User không phải chủ booking |
| `Booking không ở trạng thái chờ thanh toán` | 400 | Booking đã được thanh toán |
| `Booking đã được thanh toán` | 400 | Payment thành công đã tồn tại |

---

## Next Steps

➡️ **Phase 9: Notifications Module** - Gửi thông báo real-time cho users

---

**Version:** 1.0
**Last Updated:** 2026-05-11
