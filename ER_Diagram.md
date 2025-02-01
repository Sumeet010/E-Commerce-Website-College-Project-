# E-commerce Database Design

## Entity Relationship Diagram

### Users
- **user_id** (PK)
- email
- password_hash
- first_name
- last_name
- phone_number
- created_at
- updated_at
- last_login

### User_Addresses
- **address_id** (PK)
- user_id (FK)
- address_line1
- address_line2
- city
- state
- postal_code
- country
- is_default
- address_type (billing/shipping)

### Categories
- **category_id** (PK)
- name
- description
- image_url
- parent_category_id (FK, self-referential)
- is_active

### Products
- **product_id** (PK)
- category_id (FK)
- name
- description
- price
- sale_price
- stock_quantity
- image_urls (JSON array)
- specifications (JSON)
- brand
- weight
- dimensions
- is_active
- created_at
- updated_at

### Orders
- **order_id** (PK)
- user_id (FK)
- shipping_address_id (FK)
- billing_address_id (FK)
- order_date
- total_amount
- shipping_cost
- tax_amount
- discount_amount
- order_status
- payment_status
- tracking_number
- expected_delivery_date

### Order_Items
- **order_item_id** (PK)
- order_id (FK)
- product_id (FK)
- quantity
- unit_price
- total_price
- discount_applied

### Cart
- **cart_id** (PK)
- user_id (FK)
- created_at
- updated_at

### Cart_Items
- **cart_item_id** (PK)
- cart_id (FK)
- product_id (FK)
- quantity
- added_at

### Payments
- **payment_id** (PK)
- order_id (FK)
- payment_method
- payment_status
- amount
- transaction_id
- payment_date
- gateway_response

### Wishlist
- **wishlist_id** (PK)
- user_id (FK)
- product_id (FK)
- added_at

### Reviews
- **review_id** (PK)
- product_id (FK)
- user_id (FK)
- rating
- comment
- review_date
- is_verified_purchase

### Coupons
- **coupon_id** (PK)
- code
- discount_type (percentage/fixed)
- discount_value
- min_purchase_amount
- valid_from
- valid_until
- usage_limit
- times_used

## Relationships

1. **Users - User_Addresses**
   - One-to-Many (1:N)
   - A user can have multiple addresses

2. **Categories - Products**
   - One-to-Many (1:N)
   - A category can have multiple products

3. **Users - Orders**
   - One-to-Many (1:N)
   - A user can have multiple orders

4. **Orders - Order_Items**
   - One-to-Many (1:N)
   - An order can have multiple items

5. **Products - Order_Items**
   - One-to-Many (1:N)
   - A product can be in multiple order items

6. **Users - Cart**
   - One-to-One (1:1)
   - A user has one cart

7. **Cart - Cart_Items**
   - One-to-Many (1:N)
   - A cart can have multiple items

8. **Orders - Payments**
   - One-to-Many (1:N)
   - An order can have multiple payment attempts

9. **Users - Wishlist**
   - One-to-Many (1:N)
   - A user can have multiple wishlist items

10. **Products - Reviews**
    - One-to-Many (1:N)
    - A product can have multiple reviews

## Additional Features to be Implemented

### Product Features
- Inventory tracking
- Multiple product images
- Product variants (size, color)
- Related products
- Product tags

### Order Features
- Order tracking
- Order history
- Order notifications
- Return/Refund handling

### User Features
- Saved payment methods
- Order preferences
- Notification preferences
- Purchase history

### Payment Features
- Multiple payment gateways
- Payment verification
- Refund processing
- Payment history

### Shopping Features
- Price alerts
- Stock notifications
- Recently viewed products
- Recommended products
