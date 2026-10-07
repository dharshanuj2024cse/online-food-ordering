-- Complete Online Food Ordering System - Seed Data
USE food_ordering;

-- 1. Insert Users (Bcrypt hash for Admin@123 is $2a$10$1znDMsCLjT7BCV41mt1mLe//cBxdlUOJkKZS0QHuipmvQh3eaHAni)
-- (Bcrypt hash for User@123 is $2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La)
INSERT INTO users (id, name, email, phone, password, role, status) VALUES
(1, 'Admin Manager', 'admin@foodapp.com', '+91 9876543210', '$2a$10$1znDMsCLjT7BCV41mt1mLe//cBxdlUOJkKZS0QHuipmvQh3eaHAni', 'admin', 'active'),
(2, 'Demo Customer', 'user@foodapp.com', '+91 9876543211', '$2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La', 'customer', 'active'),
(3, 'Priya Sharma', 'priya.sharma@example.com', '+91 9876543212', '$2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La', 'customer', 'active'),
(4, 'Rahul Verma', 'rahul.verma@example.com', '+91 9876543213', '$2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La', 'customer', 'active'),
(5, 'Ananya Patel', 'ananya.patel@example.com', '+91 9876543214', '$2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La', 'customer', 'active'),
(6, 'Vikram Singh', 'vikram.singh@example.com', '+91 9876543215', '$2a$10$v4nECSo2rj5VASD2OsRfhuHEyOrMu7WpsEvRbCgJPsK6Myyre75La', 'customer', 'active');

-- 2. Insert Categories (8 categories)
INSERT INTO categories (id, name, description, image, status) VALUES
(1, 'Pizza', 'Freshly baked artisan crusts topped with Italian herbs and rich mozzarella', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', 'active'),
(2, 'Burger', 'Flame-grilled gourmet patties served in soft toasted sesame brioche buns', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 'active'),
(3, 'Biryani', 'Royal fragrant basmati rice slow-cooked with saffron and exotic spices', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', 'active'),
(4, 'Indian', 'Rich, aromatic curries, cottage cheese specialties, and tandoori breads', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80', 'active'),
(5, 'Chinese', 'Wok-tossed noodles, fiery fried rice, spicy Manchurian, and dumplings', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80', 'active'),
(6, 'Desserts', 'Decadent chocolate delights, traditional sweets, and artisanal pastries', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80', 'active'),
(7, 'Beverages', 'Chilled refreshers, sparkling sodas, fruit juices, and classic mocktails', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=80', 'active'),
(8, 'Snacks', 'Crispy golden finger foods, starters, and crunchy street-style favorites', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80', 'active');

-- 3. Insert Food Items (32 items across 8 categories)
INSERT INTO food_items (id, category_id, name, description, price, image, ingredients, rating, is_vegetarian, is_available) VALUES
-- Category 1: Pizza
(1, 1, 'Margherita Classic Pizza', 'Authentic Neapolitan pizza topped with san marzano tomato sauce, fresh mozzarella, and aromatic basil.', 299.00, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80', 'San Marzano tomatoes, Fresh mozzarella, Basil leaves, Extra virgin olive oil', 4.7, 1, 1),
(2, 1, 'Farmhouse Veggie Pizza', 'Crisp bell peppers, sweet corn, mushrooms, red onions, and mozzarella on a golden crust.', 349.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80', 'Bell peppers, Sweet corn, Fresh mushrooms, Black olives, Mozzarella cheese', 4.6, 1, 1),
(3, 1, 'BBQ Chicken Pizza', 'Smoky shredded barbecue chicken, sliced red onions, cilantro, and melted gouda & mozzarella.', 399.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80', 'Smoky chicken breast, Hickory BBQ sauce, Red onion, Gouda, Mozzarella', 4.8, 0, 1),
(4, 1, 'Spicy Pepperoni Feast', 'Generously covered with crisp spicy beef/chicken pepperoni slices and double mozzarella cheese.', 449.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80', 'Classic pepperoni, Herb tomato sauce, Double mozzarella, Oregano', 4.9, 0, 1),

-- Category 2: Burger
(5, 2, 'Crispy Veggie Crunch Burger', 'Golden spiced vegetable patty with crisp lettuce, pickled gherkins, and house creamy mayo.', 179.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80', 'Vegetable patty, Crisp lettuce, Tomato, Pickles, Eggless garlic mayo, Brioche bun', 4.4, 1, 1),
(6, 2, 'Classic Double Cheese Burger', 'Juicy grilled chicken patty loaded with melted cheddar cheese slice, caramelized onions, and secret sauce.', 249.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 'Grilled chicken patty, Cheddar cheese, Caramelized onions, Burger relish, Toasted bun', 4.8, 0, 1),
(7, 2, 'Crispy Zinger Chicken Burger', 'Crispy buttermilk-fried chicken fillet topped with spicy peri-peri slaw and chipotle dressing.', 269.00, 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop&q=80', 'Buttermilk fried chicken, Shredded cabbage slaw, Chipotle mayo, Brioche bun', 4.9, 0, 1),
(8, 2, 'Paneer Tikka Fusion Burger', 'Tandoori-spiced char-grilled paneer steak with mint chutney spread and crunchy rings of onion.', 219.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80', 'Paneer slab, Tandoori marinade, Mint coriander mayo, Sliced capsicum, Bun', 4.5, 1, 1),

-- Category 3: Biryani
(9, 3, 'Hyderabadi Chicken Dum Biryani', 'Slow-cooked aromatic basmati rice layered with succulent marinated chicken, saffron, and fried onions.', 280.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', 'Long-grain basmati, Farm chicken, Saffron milk, Biryani spices, Mint, Ghee, Fried onions', 4.9, 0, 1),
(10, 3, 'Royal Mutton Dum Biryani', 'Tender cuts of mutton slow-cooked in sealed clay pots with royal shahi spices and fragrant kewra water.', 380.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80', 'Tender goat mutton, Aged basmati rice, Green cardamom, Shahi jeera, Ghee, Mint', 4.9, 0, 1),
(11, 3, 'Special Paneer Tikka Biryani', 'Marinated tandoori paneer cubes layered with spiced saffron basmati rice and fresh mint leaves.', 240.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80', 'Aged basmati rice, Fresh malai paneer, Biryani masala, Brown onion, Coriander, Ghee', 4.6, 1, 1),
(12, 3, 'Lucknowi Vegetable Dum Biryani', 'Garden-fresh vegetables cooked with aromatic whole spices, saffron water, and long basmati grains.', 220.00, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=500&auto=format&fit=crop&q=80', 'French beans, Carrots, Green peas, Basmati rice, Saffron, Roasted cashews', 4.5, 1, 1),

-- Category 4: Indian
(13, 4, 'Butter Chicken Delhi Style', 'Tender tandoori chicken cooked in a velvety, rich tomato, butter, and cashew cream gravy.', 320.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80', 'Tandoori chicken pieces, Tomato puree, Butter, Fresh cream, Kasuri methi, Cashew paste', 4.9, 0, 1),
(14, 4, 'Paneer Butter Masala', 'Fresh cottage cheese cubes simmered in a mildly spiced, sweet and creamy rich onion-tomato gravy.', 270.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80', 'Malai paneer, Ripe tomatoes, Butter, Cashews, Cream, Garam masala, Kasuri methi', 4.8, 1, 1),
(15, 4, 'Dal Makhani Special', 'Black lentils and kidney beans slow-cooked overnight with butter, cream, and gentle smoky spices.', 210.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80', 'Whole black urad dal, Rajma, White butter, Cream, Ginger, Garlic, Tomato reduction', 4.7, 1, 1),
(16, 4, 'Garlic Butter Naan (2 Pcs)', 'Tandoor-baked leavened flatbread brushed with molten butter and sprinkled with roasted minced garlic.', 70.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80', 'Refined flour, Fresh yeast, Garlic bits, Coriander, Pure desi butter', 4.8, 1, 1),

-- Category 5: Chinese
(17, 5, 'Hakka Veg Fried Rice', 'Fragrant rice wok-tossed on high flame with finely diced carrots, beans, bell peppers, and scallions.', 180.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80', 'Steamed rice, Spring onions, French beans, Carrots, Light soy sauce, White pepper', 4.4, 1, 1),
(18, 5, 'Chilli Chicken Dry', 'Crispy batter-fried chicken chunks tossed with diced capsicum, onions, and spicy dark soya sauce.', 260.00, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=80', 'Boneless chicken cubes, Green chillies, Soya sauce, Garlic, Bell pepper, Cornstarch', 4.8, 0, 1),
(19, 5, 'Schezwan Chicken Noodles', 'Spicy wok-tossed wheat noodles loaded with shredded chicken and fiery homemade Schezwan sauce.', 230.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80', 'Noodles, Shredded chicken, Schezwan peppers, Garlic, Vinegar, Spring onions', 4.6, 0, 1),
(20, 5, 'Veg Manchurian Gravy', 'Crispy minced vegetable balls submerged in a tangy, savory ginger-garlic and soya chili gravy.', 199.00, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=80', 'Cabbage, Carrots, Soy sauce, Ginger, Garlic, Spring onions, Coriander', 4.5, 1, 1),

-- Category 6: Desserts
(21, 6, 'Hot Gulab Jamun (2 Pcs)', 'Melt-in-the-mouth golden fried milk dumplings soaked in cardamom and saffron-infused sugar syrup.', 80.00, 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=500&auto=format&fit=crop&q=80', 'Mawa / Khoya, Green cardamom, Saffron strands, Rose water syrup, Pistachios', 4.9, 1, 1),
(22, 6, 'Death By Chocolate Brownie', 'Fudgy warm Belgian dark chocolate brownie topped with chocolate drizzle and roasted walnuts.', 140.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', 'Dark cocoa, Butter, Brown sugar, Walnuts, Dark chocolate ganache', 4.8, 1, 1),
(23, 6, 'Belgian Chocolate Ice Cream', 'Creamy artisanal dark chocolate ice cream churned with crunchy chocolate curls.', 110.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80', 'Dairy cream, Belgian chocolate, Pure milk, Cocoa nibs', 4.7, 1, 1),
(24, 6, 'Rasmalai Royal (2 Pcs)', 'Delicate cottage cheese patties soaked in thick, chilled sweetened milk flavored with saffron & pistachios.', 95.00, 'https://images.unsplash.com/photo-1645855077708-32f22b7dc53b?w=500&auto=format&fit=crop&q=80', 'Chhena patties, Full fat milk, Saffron, Cardamom, Pistachio slivers', 4.8, 1, 1),

-- Category 7: Beverages
(25, 7, 'Fresh Mango Alphonso Smoothie', 'Thick, creamy smoothie prepared with sun-ripened Alphonso mango pulp and chilled milk.', 120.00, 'https://images.unsplash.com/photo-1546173159-315724a31d9b?w=500&auto=format&fit=crop&q=80', 'Alphonso mango pulp, Cold fresh milk, Natural honey, Cardamom pinch', 4.8, 1, 1),
(26, 7, 'Virgin Mint Mojito', 'Crisp sparkling mocktail with muddled fresh garden mint, zesty lime wedges, and chilled soda.', 99.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', 'Fresh mint leaves, Fresh lemon juice, Sugar cane syrup, Chilled club soda, Crushed ice', 4.7, 1, 1),
(27, 7, 'Cold Brew Iced Coffee', 'Smooth 16-hour slow-steeped Arabica coffee poured over ice cubes with a splash of sweet milk.', 110.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', 'Arabica coffee roast, Condensed milk, Ice cubes, Filtered spring water', 4.6, 1, 1),
(28, 7, 'Classic Coca-Cola Can (330ml)', 'Chilled sparkling carbonated beverage served with ice cubes.', 50.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80', 'Carbonated water, Caramel color, Caffeine, Natural flavorings', 4.5, 1, 1),

-- Category 8: Snacks
(29, 8, 'Crispy French Fries (Peri Peri)', 'Golden fried potatoes tossed in fiery zesty peri-peri spice seasoning, served with creamy dip.', 119.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80', 'Potato batons, Sea salt, Peri peri spice mix, Herb garlic mayo', 4.6, 1, 1),
(30, 8, 'Amritsari Paneer Pakora (6 Pcs)', 'Crispy gram-flour battered cottage cheese cubes stuffed with mint chutney and sprinkled with chaat masala.', 160.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80', 'Fresh paneer, Besan (gram flour), Ajwain, Chaat masala, Green mint chutney', 4.7, 1, 1),
(31, 8, 'Chicken Cheese Balls (6 Pcs)', 'Crunchy golden breaded chicken balls stuffed with gooey molten cheddar and mozzarella cheese.', 199.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80', 'Minced chicken breast, Cheddar cheese, Bread crumbs, Garlic powder, Italian herbs', 4.8, 0, 1),
(32, 8, 'Crispy Spring Rolls (4 Pcs)', 'Delicate fried pastry rolls filled with shredded crunchy vegetables, served with sweet chili sauce.', 149.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Spring roll pastry, Shredded cabbage, Carrots, Glass noodles, Sweet chili dip', 4.5, 1, 1);

-- 4. Insert Addresses for Demo Customer (user_id = 2)
INSERT INTO addresses (id, user_id, full_name, phone, address, city, state, pincode, is_default) VALUES
(1, 2, 'Demo Customer', '+91 9876543211', 'Flat 402, Green Meadows, 5th Main, Koramangala', 'Bangalore', 'Karnataka', '560034', 1),
(2, 2, 'Demo Customer (Office)', '+91 9876543211', 'Tech Park Block B, 3rd Floor, Outer Ring Road', 'Bangalore', 'Karnataka', '560103', 0),
(3, 3, 'Priya Sharma', '+91 9876543212', 'Villa 12, Palm Grove Residences', 'Mumbai', 'Maharashtra', '400050', 1);

-- 5. Insert Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, minimum_order, maximum_discount, expiry_date, usage_limit, used_count, status) VALUES
(1, 'WELCOME50', 'percentage', 50.00, 300.00, 100.00, '2027-12-31', 500, 12, 'active'),
(2, 'FOODIE20', 'percentage', 20.00, 400.00, 150.00, '2027-12-31', 1000, 45, 'active'),
(3, 'FLAT100', 'fixed', 100.00, 500.00, 100.00, '2027-12-31', 300, 28, 'active'),
(4, 'FEAST30', 'percentage', 30.00, 600.00, 200.00, '2027-12-31', 200, 8, 'active');

-- 6. Insert Cart for Demo Customer (user_id = 2)
INSERT INTO cart (id, user_id) VALUES
(1, 2);

INSERT INTO cart_items (cart_id, food_id, quantity) VALUES
(1, 9, 1),
(1, 26, 1);

-- 7. Insert Sample Orders
INSERT INTO orders (id, order_number, user_id, address_id, coupon_id, subtotal, delivery_fee, tax, discount, total, payment_method, payment_status, order_status, delivery_address_json, created_at) VALUES
(1, 'ORD-10001', 2, 1, 1, 579.00, 0.00, 28.95, 100.00, 507.95, 'ONLINE', 'PAID', 'DELIVERED', '{"full_name":"Demo Customer","phone":"+91 9876543211","address":"Flat 402, Green Meadows, 5th Main, Koramangala","city":"Bangalore","state":"Karnataka","pincode":"560034"}', '2026-10-05 13:30:00'),
(2, 'ORD-10002', 3, 3, 3, 620.00, 0.00, 31.00, 100.00, 551.00, 'COD', 'PAID', 'DELIVERED', '{"full_name":"Priya Sharma","phone":"+91 9876543212","address":"Villa 12, Palm Grove Residences","city":"Mumbai","state":"Maharashtra","pincode":"400050"}', '2026-10-06 14:15:00'),
(3, 'ORD-10003', 2, 1, NULL, 379.00, 40.00, 18.95, 0.00, 437.95, 'COD', 'PENDING', 'PREPARING', '{"full_name":"Demo Customer","phone":"+91 9876543211","address":"Flat 402, Green Meadows, 5th Main, Koramangala","city":"Bangalore","state":"Karnataka","pincode":"560034"}', '2026-10-07 18:45:00'),
(4, 'ORD-10004', 4, NULL, 2, 450.00, 40.00, 22.50, 90.00, 422.50, 'ONLINE', 'PAID', 'OUT_FOR_DELIVERY', '{"full_name":"Rahul Verma","phone":"+91 9876543213","address":"H-14, Connaught Place","city":"New Delhi","state":"Delhi","pincode":"110001"}', '2026-10-07 19:10:00'),
(5, 'ORD-10005', 5, NULL, NULL, 399.00, 40.00, 19.95, 0.00, 458.95, 'ONLINE', 'PAID', 'CONFIRMED', '{"full_name":"Ananya Patel","phone":"+91 9876543214","address":"Sector 17 C","city":"Chandigarh","state":"Punjab","pincode":"160017"}', '2026-10-07 19:20:00');

-- 8. Insert Order Items
INSERT INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
-- Order 1: ORD-10001
(1, 1, 1, 'Margherita Classic Pizza', 299.00, 1, 299.00),
(2, 1, 9, 'Hyderabadi Chicken Dum Biryani', 280.00, 1, 280.00),

-- Order 2: ORD-10002
(3, 2, 10, 'Royal Mutton Dum Biryani', 380.00, 1, 380.00),
(4, 2, 11, 'Special Paneer Tikka Biryani', 240.00, 1, 240.00),

-- Order 3: ORD-10003
(5, 3, 7, 'Crispy Zinger Chicken Burger', 269.00, 1, 269.00),
(6, 3, 27, 'Cold Brew Iced Coffee', 110.00, 1, 110.00),

-- Order 4: ORD-10004
(7, 4, 3, 'BBQ Chicken Pizza', 399.00, 1, 399.00),
(8, 4, 28, 'Classic Coca-Cola Can (330ml)', 50.00, 1, 50.00),

-- Order 5: ORD-10005
(9, 5, 4, 'Spicy Pepperoni Feast', 449.00, 1, 449.00);
