require 'faker'

50.times do
  User.create!(
    email_address: Faker::Internet.unique.email,
    password: 'password',
    created_at: Faker::Time.between(from: 1.month.ago, to: Time.now),
    updated_at: Time.now
  )
end

puts "50 users created!"
