const API_URL = 'http://localhost:5000/api'

export async function getCourses() {
  const response = await fetch(`${API_URL}/courses`)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch courses')
  }

  return data.map((course) => ({
    ...course,
    instructor: course.instructor_name,
    category: course.category_name,
    thumbnailColor: course.thumbnail_color,
    rating: course.rating ?? 0,
    students: course.students ?? 0,
    price:
      Number(course.price) === 0
        ? 'FREE'
        : course.price,
  }))
}

export async function getCourseById(id) {
  const response = await fetch(`${API_URL}/courses/${id}`)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch course')
  }

  return data
}

export async function getMyCourses(token) {
  const response = await fetch(`${API_URL}/courses/my-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch your courses')
  }

  return data.map((course) => ({
    ...course,
    instructor: course.instructor_name,
    category: course.category_name,
    thumbnailColor: course.thumbnail_color,
    rating: course.rating ?? 0,
    students: course.students ?? 0,
    price:
      Number(course.price) === 0
        ? 'FREE'
        : course.price,
  }))
}

export async function deleteCourse(id, token) {
  const response = await fetch(`${API_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete course')
  }

  return data
}
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch categories");
  }

  return data;
}

export async function createCourse(courseData, token) {
  const response = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create course");
  }

  return data;
}