import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardLayout from "./DashboardLayout";
import StaffDashboard from "./StaffDashboard";
import InventoryList from "./InventoryList";
import AddProduct from "./Addproduct";
import ViewProduct from "./Viewproduct";
import ReceiveProduct from "./ReceiveProduct";
import DispatchProduct from "./DispatchProduct";
import StaffViewProfile from "./StaffViewProfile";
import StaffSettings from "./StaffSettings";
import ProtectedRoute from "./ProtectedRoute";

const initialProducts = [
  {
    name: "Aircon Split Type 1.5HP",
    category: "Appliances",
    stock: 24,
    status: "In Stock",
    photo: "https://metroplazadavao.com/cdn/shop/products/KolinKSM-SW15-5G1M_300x.jpg?v=1589725569",
  },
  {
    name: "Canon PIXMA G3010",
    category: "Electronics",
    stock: 8,
    status: "Low Stock",
    photo: "https://ansons.ph/wp-content/uploads/2023/06/02_PIXMA-G3010_01.png",
  },
  {
    name: "Office Chair Ergonomic",
    category: "Furniture",
    stock: 0,
    status: "Out Of Stock",
    photo: "https://flexispot.ph/wp-content/uploads/2021/05/C7x800x800.webp",
  },
];

const getStatus = (stock) => {
  if (stock <= 0) return "Out Of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
};

// Routes now live in their own component, rendered under <BrowserRouter>,
// so useNavigate() can be used here (it can't be used in App itself).
function AppRoutes({
  user,
  setUser,
  avatarUrl,
  setAvatarUrl,
  productList,
  handleLogin,
  handleLogout,
  addProduct,
  updateProduct,
  applyStockChange,
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <DashboardLayout
              staffName={user?.username}
              avatarUrl={avatarUrl}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />

        <Route path="inventory" element={<InventoryList items={productList} />} />
        <Route
          path="inventory/add"
          element={
            <AddProduct
              categories={[...new Set(productList.map((p) => p.category))]}
              onSubmit={addProduct}
            />
          }
        />
        <Route
          path="inventory/view/:name"
          element={<ViewProduct products={productList} onUpdate={updateProduct} />}
        />
        <Route
          path="inventory/receive/:name"
          element={
            <ReceiveProduct
              products={productList}
              onApply={(name, qty) => applyStockChange(name, "Receive", qty)}
            />
          }
        />
        <Route
          path="inventory/dispatch/:name"
          element={
            <DispatchProduct
              products={productList}
              onApply={(name, qty) => applyStockChange(name, "Dispatch", qty)}
            />
          }
        />

        <Route
          path="profile"
          element={<StaffViewProfile username={user?.username} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />}
        />
        <Route
          path="settings"
          element={
            <StaffSettings
              username={user?.username}
              onSave={({ username: newUsername }) => {
                if (newUsername) setUser((u) => ({ ...u, username: newUsername }));
                navigate("/");
              }}
              onCancel={() => navigate("/")}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [productList, setProductList] = useState(initialProducts);

  const handleLogin = ({ username, password }) => {
    console.log(username, password);
    setUser({ username });
  };

  const handleLogout = () => {
    setUser(null);
    setAvatarUrl("");
  };

  const addProduct = (formData) => {
    const stockNum = Number(formData.stock) || 0;
    const newProduct = {
      name: formData.name,
      category: formData.category,
      stock: stockNum,
      status: getStatus(stockNum),
      ...(formData.price ? { price: formData.price } : {}),
      ...(formData.photo ? { photo: URL.createObjectURL(formData.photo) } : {}),
    };
    setProductList((prev) => [...prev, newProduct]);
  };

  const updateProduct = (productName, updates) => {
    setProductList((prev) =>
      prev.map((p) => (p.name === productName ? { ...p, ...updates } : p))
    );
  };

  const applyStockChange = (productName, mode, quantity) => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;
    setProductList((prev) =>
      prev.map((p) => {
        if (p.name !== productName) return p;
        const newStock = mode === "Receive" ? p.stock + qty : Math.max(0, p.stock - qty);
        return { ...p, stock: newStock, status: getStatus(newStock) };
      })
    );
  };

  return (
    <BrowserRouter>
      <AppRoutes
        user={user}
        setUser={setUser}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        productList={productList}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        addProduct={addProduct}
        updateProduct={updateProduct}
        applyStockChange={applyStockChange}
      />
    </BrowserRouter>
  );
}

export default App;