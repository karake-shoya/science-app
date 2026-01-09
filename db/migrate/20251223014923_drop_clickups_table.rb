class DropClickupsTable < ActiveRecord::Migration[8.1]
  def change
    drop_table :clickups, if_exists: true
  end
end
