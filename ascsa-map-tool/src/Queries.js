const BASE_URL = import.meta.env.VITE_BASE_URL;

export const addCollectionDB = async (data) => {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw { status: res.status };
  return res.json();
};

export const updateCollectionDB = async (data) => {
  const res = await fetch(`${BASE_URL}/collections/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.values),
  });
  if (!res.ok) throw { status: res.status };
  return res.json();
};

export const getCollectionsDB = async (data) => {
  const res = await fetch(`${BASE_URL}/collections/${data}`);
  if (!res.ok) throw { status: res.status };
  return res.json();
};

export const deleteCollectionDB = async (id) => {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw { status: res.status };
  return res.json();
};

export async function fetchFromTextSearch(searchParams) {
  return fetch(
    `${BASE_URL}/findings/search-text?${new URLSearchParams(searchParams).toString()}`
  ).then((res) => {
    if (!res.ok) throw new Error("Searching text request failed");
    return res.json();
  });
}

export async function fetchPoints() {
  const res = await fetch(`${BASE_URL}/findings`);
  if (!res.ok) throw new Error("Failed to fetch points");
  const dt = await res.json();
  return dt;
}

// GET single point by name
export const pointQueryKey = (name) => ["point", name];

export async function fetchPointData(name) {
  const res = await fetch(`${BASE_URL}/findings/${name}`);
  if (!res.ok) throw new Error("Failed to fetch point with name " + name);
  const dt = await res.json();
  return dt;
}

// Authorization calls

async function register(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch();
  if (!res.ok) throw { status: res.status, payload };
  return payload;
}

export const registerUser = (body) => register("/auth/register", body);

export const loginUser = async (body) => {
  const params = new URLSearchParams();
  params.append("username", body.username);
  params.append("password", body.password);
  params.append("grant_type", "password");

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, payload };
  return payload;
};

export async function verifyToken(token) {
  if (!token) {
    throw { status: 401, payload: { message: "No token" } };
  }
  const res = await fetch(`${BASE_URL}/auth/verify`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, payload };
  return payload;
}
