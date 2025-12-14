export interface ApiError {
  status?: number
  message: string
}

export interface ListWorkoutsResponse {
  workouts: import('./workout').Workout[]
}

export interface GetWorkoutResponse {
  workout: import('./workout').Workout
}
