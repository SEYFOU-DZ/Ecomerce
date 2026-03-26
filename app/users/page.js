import { cookies } from "next/headers";

async function getUsers() {
  const API_URI = process.env.NEXT_PUBLIC_API_URI;
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  if (!API_URI) {
    throw new Error("server error");
  }

  const res = await fetch(`${API_URI}api/auth/users`, {
    cache: "no-store",
        headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to attract users");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.users || [];
}

export default async function UsersPage() {
  try {
    const users = await getUsers();

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">قائمة المستخدمين</h1>

        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500">لا يوجد مستخدمين للعرض.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border-b">الإسم</th>
                  <th className="p-2 border-b">الإيميل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{user.name}</td>
                    <td className="p-2 border-b">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">قائمة المستخدمين</h1>
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-4">
          <p className="text-red-600 mb-2">🚫 {err.message}</p>
        </div>
      </div>
    );
  }
}