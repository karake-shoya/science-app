class CreateClickups < ActiveRecord::Migration[8.1]
  def change
    create_table :clickups do |t|
      t.string :name
      t.timestamps
    end
  end
end
