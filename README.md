# E-commerce Website

A responsive e-commerce website with Firebase authentication and dynamic product categories.

## Features

### User Authentication
- User signup and login functionality
- Protected purchase routes
- User session management

### Product Categories
- Electronics
- Fashion
- Grocery
- Home & Furniture
- Toys & Kid Accessories

## Setup Instructions

1. Clone the repository:

2. Firebase Setup:
   - Create a Firebase project
   - Enable Authentication
   - Create firebase-config.js in js/ folder:

3. Open index.html in your browser

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Firebase
  - Authentication
  - Firestore Database
- Custom Web Components

## Project Structure

e-commerce-website/
│
├── components/
│   └── header.js                 # Reusable header component
│
├── css/
│   └── style.css                 # Global styles
│
├── js/
│   └── firebase-config.js        # Firebase configuration
│
├── pages/
│   ├── Electronics.html          # Electronics category page
│   ├── Fashion.html             # Fashion category page
│   ├── Grocery.html             # Grocery category page
│   ├── Home.html                # Home & Furniture category page
│   ├── Toys.html                # Toys category page
│   ├── login.html               # User login page
│   └── register.html            # User registration page
│
├── images/                       # Image assets
│   ├── slider/                  # Slider images
│   ├── categories/              # Category images
│   └── products/                # Product images
│
├── index.html                   # Home page

## Features to be Added

- Shopping cart functionality
- Payment integration
- Order history
- User profile management
- Product search
- Product filtering

## License

This project is licensed under the MIT License.

