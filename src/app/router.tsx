import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Categories from '../pages/Categories'
import Products from '../pages/Products'
import Promotions from '../pages/Promotions'
import Sales from '../pages/Sales'
import CmsPage from '../pages/CmsPage'
import Orders from '../pages/Orders'
import Inventory from '../pages/Inventory'
import Users from '../pages/Users'
import Customers from '../pages/Customers'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/pages" element={<CmsPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/users" element={<Users />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </BrowserRouter>
  )
}
