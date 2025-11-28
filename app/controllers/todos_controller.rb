class TodosController < ApplicationController
  before_action :set_todo, only: [ :update, :destroy ]

  def index
    @todos = Current.user.todos.recent
    render json: {
      incomplete: @todos.incomplete,
      complete: @todos.complete
    }
  end

  def create
    @todo = Current.user.todos.build(todo_params)
    if @todo.save
      render json: @todo, status: :created
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @todo.update(todo_params)
      render json: @todo
    else
      render json: { errors: @todo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @todo.destroy
    head :no_content
  end

  private

  def set_todo
    @todo = Current.user.todos.find(params[:id])
  end

  def todo_params
    params.require(:todo).permit(:content, :completed)
  end
end
