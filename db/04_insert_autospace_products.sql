-- SQL script to insert 32 AutoSpace products for the 2 business accounts in "AutoSpace" schema ONLY
DO $$
DECLARE
  account RECORD;
BEGIN
  -- Iterate over all non-superadmin accounts in AutoSpace.profiles
  FOR account IN 
    SELECT user_id, email FROM "AutoSpace".profiles 
    WHERE email != 'superadmin-autospace@buildstart.io'
  LOOP
    RAISE NOTICE 'Adding/updating products for user: % (%)', account.email, account.user_id;

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Custom seat covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Custom seat covers', 'Custom-fit tailored leather and fabric seat covers designed specifically for your vehicle model and interior theme.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Custom seat covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('universal seat covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'universal seat covers', 'High-quality universal fit seat covers with easy installation, durable material, and modern styling.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('universal seat covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('3D carpets')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, '3D carpets', 'Precision-molded 3D floor mats providing all-weather protection and anti-slip backing.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('3D carpets');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Android players')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Android players', 'High-definition IPS touchscreen Android multimedia player with Apple CarPlay, Android Auto, GPS, and Bluetooth.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Android players');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('360 System')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, '360 System', '360-degree panoramic bird-view camera monitoring system with real-time 3D surround view for safe driving and parking.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('360 System');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('DVR/Dash camera')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'DVR/Dash camera', 'Dual front and rear full HD dash cam with night vision, wide-angle lens, parking monitoring, and loop recording.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('DVR/Dash camera');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Door visors')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Door visors', 'Aerodynamic weather guards and door visors with custom fit chrome or smoke finish for rain and sun protection.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Door visors');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Welcome light / Scuff light')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Welcome light / Scuff light', 'LED illuminated door sill scuff plates and under-door puddle welcome logo lights with custom branding.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Welcome light / Scuff light');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Plastic protection')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Plastic protection', 'Interior and exterior plastic trim protection film and ceramic coating against UV damage, fading, and scratches.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Plastic protection');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Tinted')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Tinted', 'High heat-rejection nano-ceramic solar control window tinting film for UV block and cabin privacy.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Tinted');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Spoilers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Spoilers', 'Sporty rear boot lid and roof spoilers with aerodynamic styling and custom color-match paint or gloss black.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Spoilers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Key covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Key covers', 'Premium TPU and carbon-fiber pattern smart remote key case covers for all automotive key fobs.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Key covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Side step')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Side step', 'Heavy-duty aluminum and steel running boards/side steps for SUVs and pickup trucks with non-slip stepping surface.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Side step');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Subwoofers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Subwoofers', 'High-power active under-seat or trunk-mounted bass subwoofers with built-in amplifier for deep punchy audio.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Subwoofers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Android frames')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Android frames', 'OEM-fit dashboard fascia panels and replacement frames for Android player installation tailored to your car model.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Android frames');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Fog light')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Fog light', 'High-intensity LED projector fog lamps with dual-color switch (white/yellow) and daytime running lights.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Fog light');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Head lights')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Head lights', 'Custom LED/bi-xenon projector headlight assemblies, dynamic sequential indicators, and angel eye DRL upgrades.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Head lights');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('GR steering wheels')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'GR steering wheels', 'Sporty GR Gazoo Racing style steering wheel with premium perforated leather, carbon fiber accents, and red stitching.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('GR steering wheels');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Universal steering wheels')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Universal steering wheels', 'Universal aftermarket sports steering wheels with ergonomic grip, horn button, and alloy spokes.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Universal steering wheels');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Car covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Car covers', 'All-weather waterproof, dustproof, and UV-reflective full car body covers with soft scratch-free cotton lining.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Car covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Arm rest')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Arm rest', 'Center console armrest box with dual-layer storage compartment, padded leather top, and integrated USB charging ports.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Arm rest');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Chrome items')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Chrome items', 'Exterior chrome styling packages including door handle covers, side mirror caps, and tail lamp garnish.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Chrome items');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Stainless steel trim')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Stainless steel trim', 'Premium stainless steel sill guards, window frame moldings, and bumper scuff protection accents.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Stainless steel trim');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('carbon fiber trims')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'carbon fiber trims', 'Interior and exterior genuine and hydro-dipped carbon fiber styling trims for dashboard, center console, and mirrors.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('carbon fiber trims');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Sound system')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Sound system', 'Complete audio enhancement package with component speakers, tweeters, multi-channel amplifier, and acoustic dampening.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Sound system');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Air freshners')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Air freshners', 'Long-lasting luxury automotive air fresheners, aroma diffusers, and AC vent fragrance clips.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Air freshners');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('steering covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'steering covers', 'Premium slip-on ergonomic leather steering wheel covers with anti-slip inner lining.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('steering covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('stitch steering covers')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'stitch steering covers', 'Hand-stitched custom wrap steering wheel covers tailored on-site with perforated leather and contrast stitching.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('stitch steering covers');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Vacuum cleaners')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Vacuum cleaners', 'High-suction portable 12V/rechargeable car vacuum cleaner with wet/dry attachments for deep cabin cleaning.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Vacuum cleaners');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('Battery jumper packs')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'Battery jumper packs', 'Emergency portable 12V lithium jump starter power bank with smart jumper cables and LED torch.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('Battery jumper packs');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('wireless charger')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'wireless charger', 'Fast-charging wireless car charger mount and console integration pad with automated sensor grip and Qi standard.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('wireless charger');
    END IF;
    

    IF NOT EXISTS (
      SELECT 1 FROM "AutoSpace".products 
      WHERE user_id = account.user_id AND lower(name) = lower('body kit')
    ) THEN
      INSERT INTO "AutoSpace".products (
        user_id, name, description, price, product_type, is_active, variations, images, delivery_price
      ) VALUES (
        account.user_id, 'body kit', 'Complete aerodynamic body styling kit including front bumper lip spoiler, side skirts, and rear diffuser.', 0.00, 'physical', true, '[]'::jsonb, '{}'::text[], 0
      );
    ELSE
      UPDATE "AutoSpace".products 
      SET price = 0.00
      WHERE user_id = account.user_id AND lower(name) = lower('body kit');
    END IF;
    

  END LOOP;
END $$;
