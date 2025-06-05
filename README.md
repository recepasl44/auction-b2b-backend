# B2B Auction Backend

This project powers the B2B auction platform. Below are example CURL requests for the updated endpoints.

## Create Auction
```bash
curl -X POST http://localhost:3000/api/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo Auction",
    "startTime": "2025-06-10T10:00:00Z",
    "endTime": "2025-06-12T10:00:00Z",
    "startPrice": 100,
    "endPrice": 1000,
    "incrementStep": 10,
    "baseCurrency": "USD",
    "sortDirection": "asc",
    "productionId": 1,
    "supplierIds": [2,3]
  }'
```

## Place Bid
```bash
curl -X POST http://localhost:3000/api/auctions/bid \
  -H "Content-Type: application/json" \
  -d '{
    "auctionId": 1,
    "userId": 5,
    "amount": 500,
    "userCurrency": "USD"
  }' # userCurrency defaults to the auction currency
```
