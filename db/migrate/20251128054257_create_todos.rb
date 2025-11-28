class CreateTodos < ActiveRecord::Migration[8.1]
  def change
    create_table :todos do |t|
      t.string :content, null: false
      t.boolean :completed, default: false, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :todos, [ :user_id, :created_at ]
  end
end
