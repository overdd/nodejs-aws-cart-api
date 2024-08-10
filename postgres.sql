INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
('1b5b7f4e-9b1c-4e3e-8497-fded3f9c61c0', 'a3b2c1d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '2024-07-01', '2024-07-15', 'OPEN'),
('2c6d8e7f-0b1a-4c3d-8e9f-0d1e2f3a4b5c', 'b4c3d2e1-6f5a-8b7c-9d0e-1f2a3b4c5d6e', '2024-07-02', '2024-07-16', 'ORDERED'),
('3d7e9f0b-1a2c-4d5e-9f0d-2e3a4b5c6d7e', 'c5d4e3f2-7a6b-9c8d-0e1f-2a3b4c5d6e7f', '2024-07-03', '2024-07-17', 'OPEN');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
('1b5b7f4e-9b1c-4e3e-8497-fded3f9c61c0', '11111111-1111-1111-1111-111111111111', 2),
('1b5b7f4e-9b1c-4e3e-8497-fded3f9c61c0', '22222222-2222-2222-2222-222222222222', 1),
('2c6d8e7f-0b1a-4c3d-8e9f-0d1e2f3a4b5c', '33333333-3333-3333-3333-333333333333', 3),
('2c6d8e7f-0b1a-4c3d-8e9f-0d1e2f3a4b5c', '44444444-4444-4444-4444-444444444444', 2),
('3d7e9f0b-1a2c-4d5e-9f0d-2e3a4b5c6d7e', '55555555-5555-5555-5555-555555555555', 5);