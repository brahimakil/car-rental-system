
# Car Rental System - Mobile App

## Overview

The Car Rental System mobile app is designed for customers to easily browse, reserve, and manage car rentals from any location. This companion app works alongside our admin dashboard to provide a seamless car rental experience for end users.

## Features

### User Authentication
- **Registration**: New users can create an account with their personal details
- **Login**: Existing users can securely access their account
- **Password Reset**: Users can reset their password if forgotten

### Browse and Search
- **Stations**: View all available rental stations with their locations on a map
- **Categories**: Browse cars by category (Economy, Luxury, SUV, etc.)
- **Colors**: Filter cars by available colors
- **Cars**: View detailed information about each available car including:
  - Images
  - Specifications
  - Pricing
  - Availability status

### Rental Management
- **Create Rentals**: Reserve cars for specific dates
- **View Rentals**: See all past, current, and upcoming rentals
- **Cancel Rentals**: Cancel upcoming reservations (subject to cancellation policy)
- **Extend Rentals**: Request extensions for current rentals

### User Profile
- **Personal Information**: View and update personal details
  - Full name
  - Phone number
  - Address
- **Password Management**: Change account password
- **Rental History**: View complete rental history with details

### Reports
- **Spending Reports**: Track rental expenses over time
- **Usage Statistics**: View rental frequency and patterns

## Technical Requirements

### User Data Structure
When users register through the mobile app, their information will be stored in Firebase with the following structure:

```
FOR PHOTOS , ICONS , IMAGES ...... USE BASE 64 URL ONLY 

cars : [
  "availableCars",
  "createdAt",
  "description",
  "icon",
  "isActive",
  "name",
  "totalRentals",
  "updatedAt"
]

colors: [
  "createdAt",
  "description",
  "hexValue",
  "isActive",
  "name",
  "updatedAt"
]

rentals :
 [
  "carId",
  "createdAt",
  "customerAddress",
  "customerEmail",
  "customerName",
  "customerPhone",
  "endDate",
  "notes",
  "paymentStatus",
  "pickupStationId",
  "returnStationId",
  "startDate",
  "status",
  "totalAmount",
  "updatedAt",
  "userId"
]


stations: [
  "address",
  "availableCars",
  "categories",
  "city",
  "contactEmail",
  "contactPhone",
  "createdAt",
  "isActive",
  "latitude",
  "longitude",
  "name",
  "region",
  "state",
  "updatedAt",
  "zipCode"
]

users/{userId}: {
  "address": "User's address",
  "createdAt": "Timestamp",
  "email": "user@example.com",
  "isActive": true,
  "name": "Full Name",
  "phone": "Phone number",
  "role": "customer",
  "updatedAt": "Timestamp"
}
```

### Navigation Structure
The app will feature a bottom navigation bar or drawer menu with the following sections:
- Home/Dashboard
- Browse Cars
- My Rentals
- Stations
- Profile

## User Flow

### Registration Process
1. User downloads and opens the app
2. Taps "Create Account" button
3. Enters required information:
   - Full name
   - Email address
   - Password
   - Phone number
   - Address
4. Submits registration form
5. Receives confirmation email
6. Account is created with "customer" role by default

### Rental Process
1. User browses available cars by station, category, or color
2. Selects desired car and rental period
3. Reviews rental details and pricing
4. Confirms reservation
5. Receives confirmation notification and email
6. Can view the new rental in "My Rentals" section

### Profile Management
1. User navigates to Profile section
2. Can edit personal information:
   - Update phone number
   - Change address
   - Update full name
3. Can change password by:
   - Entering current password
   - Entering and confirming new password
4. All changes are immediately reflected in Firebase

## Security Considerations
- All user data is securely stored in Firebase
- Authentication uses Firebase Auth for secure login
- User role is strictly set to "customer" for mobile app registrations
- Personal information is only accessible to the user and administrators

## Integration with Admin Panel
The mobile app synchronizes with the admin dashboard:
- Cars marked as unavailable in the admin panel will not be bookable in the app
- Rentals created through the app immediately appear in the admin dashboard
- User accounts created in the app are manageable by administrators
- Station information is consistent between platforms

## Future Enhancements
- In-app payment processing
- Car damage reporting feature
- Push notifications for rental reminders
- Loyalty program integration
- Chat support with customer service


