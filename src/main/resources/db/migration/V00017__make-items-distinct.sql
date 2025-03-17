UPDATE items i1
    JOIN (
        SELECT description, MIN(id) AS first_id
        FROM items
        GROUP BY description
        HAVING COUNT(*) > 1
    ) duplicates ON i1.description = duplicates.description
    JOIN items i2 ON i1.description = i2.description
SET
    i1.placeholder = COALESCE(NULLIF(i1.placeholder, ''), i2.placeholder),
    i1.is_suggested_item = COALESCE(i1.is_suggested_item, i2.is_suggested_item),
    i1.removed = 0
WHERE i1.id > duplicates.first_id;


DELETE FROM items
WHERE id NOT IN (
    SELECT * FROM (
                      SELECT MIN(id)
                      FROM items
                      GROUP BY description
                  ) AS subquery
);


ALTER TABLE items ADD UNIQUE (description);


INSERT INTO items (description, placeholder, created, is_suggested_item, removed, category)
    VALUES
        ('Jeans', 'Men: waist, length Wmn: size', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Pants Men’s', 'Waist, length; style: cargo, casual, dress, athletic, thermal', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Pants Wmn’s', 'Size; style: sweats, leggings, capris', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Socks', 'M/L/XL; crew / ankle', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Tshirt', 'Men/Wmn; SS / LS', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Shirt Men’s', 'Size, SS/LS, style: Polo, butn up, sweatshirt, sweater, dress, thermal', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Shirt Wmn’s', 'Size, SS/LS, style: sweatshirt, sweater, casual, dressy', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Shoes', 'Men/Wmn, size range, style: sneaker, sandal, dress, boot', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Shorts', 'Men: waist, style: cargo, athletic; Wmn: size, style: capri, shorts, athletic', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Hygiene', 'List each item needed. Will not fill “Hygiene kit” request.', '2025-02-08 00:00:00',  1, 0, 'HYGIENE'),
        ('Coat', 'Men/Wmn, size, style: jacket, rain, winter', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Underwear', 'Men/Wmn, size', '2025-02-08 00:00:00',  1, 0, 'CLOTHING'),
        ('Towel', 'Bath, hand, washcloth', '2025-02-08 00:00:00',  1, 0, 'LINENS'),
        ('Sheet', 'Size, type: flat, fitted, set', '2025-02-08 00:00:00',  1, 0, 'LINENS'),
        ('Comforter', 'Size (King, Qu, Full, Twin)', '2025-02-08 00:00:00',  1, 0, 'LINENS'),
        ('First aid', 'Type: ibuprofen, acetaminophen, Neosporin, bandaids, ace bandage', '2025-02-08 00:00:00',  1, 0, 'FIRST_AID')
        AS new_items
ON DUPLICATE KEY UPDATE
                     placeholder = new_items.placeholder,
                     is_suggested_item = true,
                     removed = false,
                     category = new_items.category;

INSERT INTO items (description, placeholder, created, is_suggested_item, removed, category)
    VALUES
        ('bra', '', '2025-02-08 00:00:00', 1, 0, 'CLOTHING'),
        ('hat', '', '2025-02-08 00:00:00', 1, 0, 'ACCESSORIES'),
        ('backpack', '', '2025-02-08 00:00:00', 1, 0, 'GEAR'),
        ('tent', '', '2025-02-08 00:00:00', 1, 0, 'GEAR'),
        ('sleeping bag', '', '2025-02-08 00:00:00', 1, 0, 'GEAR'),
        ('blanket', '', '2025-02-08 00:00:00', 1, 0, 'LINENS'),
        ('bug spray', '', '2025-02-08 00:00:00', 1, 0, 'GEAR'),
        ('beanie', '', '2025-02-08 00:00:00', 1, 0, 'ACCESSORIES'),
        ('scarf', '', '2025-02-08 00:00:00', 1, 0, 'ACCESSORIES'),
        ('gloves', '', '2025-02-08 00:00:00', 1, 0, 'ACCESSORIES'),
        ('handwarmers', '', '2025-02-08 00:00:00', 1, 0, 'ACCESSORIES'),
        ('ChapStick', '', '2025-02-08 00:00:00', 1, 0, 'HYGIENE'),
        ('hand sanitizer', '', '2025-02-08 00:00:00', 1, 0, 'HYGIENE')
        AS new_items
ON DUPLICATE KEY UPDATE
                     placeholder = new_items.placeholder,
                     is_suggested_item = true,
                     removed = false,
                     category = new_items.category;
