-- Seed templates from existing POLL_TEMPLATES constant
INSERT INTO templates (name, prompt, options, category, sort_order) VALUES
(
  'Games You Love',
  'Games you love to play',
  '["Settlers of Catan", "Wingspan", "The Legend of Zelda: Tears of the Kingdom", "Baldur''s Gate 3", "Minecraft", "Ticket to Ride", "Elden Ring"]'::jsonb,
  'general',
  0
),
(
  'Best Movie of All Time',
  'What is the greatest movie ever made?',
  '["The Shawshank Redemption", "The Godfather", "Spirited Away", "The Dark Knight", "Parasite", "Pulp Fiction", "The Lord of the Rings: Return of the King"]'::jsonb,
  'general',
  1
),
(
  'Team Lunch',
  'Where should we go for team lunch?',
  '["Thai", "Pizza", "Sushi", "Tacos", "Indian", "Burgers", "Mediterranean"]'::jsonb,
  'general',
  2
)
ON CONFLICT DO NOTHING;
