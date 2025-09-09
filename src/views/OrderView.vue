<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="bg-white shadow-xl rounded-2xl p-6 transition-all duration-300 border border-gray-100">
      <form @submit.prevent="handleSubmit">
        <h2 class="text-2xl font-bold mb-4">
          Buyurtmalar
        </h2>

        <label class="block text-sm font-bold mb-2 text-gray-700">Mahsulot nomi</label>
        <select
            v-model="form.productsId"
            required
            class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">'
          <option disabled>Mahsulotni tanlang</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>

        <label
            class="block text-gray-700 font-medium mb-1">Miqdori</label>
        <input
            v-model="form.quantity"
            type="number"
            required
            placeholder="Miqdori"
            class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">

        <label class="block text-gray-700 font-medium mb-1">O'lchov birligi</label>
        <select
            v-model="form.measureId"
            required
            class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">
          <option disabled>O'lchov birligini tanlang</option>
          <option v-for="measure in measures" :key="measure.id" :value="measure.id">
            {{ measure.name }}
          </option>
        </select>
        <div v-if="isEditing" class="mb-4">
          <label class="block text-gray-700 font-medium mb-1">Status</label>
          <select
              v-model="form.status"
              class="border border-gray-300 rounded-lg p-3 w-full mb-4"
              required>
            <option value="" disabled>Holatni tanlang</option>

            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div class="flex gap-4 mb-4">
          <button
              type="submit"
              class="required bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white px-5 py-2.5 rounded-lg font-semibold shadow">
            {{ isEditing ? "Yangilash" : "Saqlash" }}
          </button>
          <button
              type="button"
              @click="resetForm"
              class="bg-gray-400 hover:bg-gray-500 transition-colors duration-200 text-white px-5 py-2.5 rounded-lg font-semibold shadow">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>

    <div v-if="orders.length" class="relative overflow-x-auto mt-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Buyurtmalar ro'yhati</h2>
      <table class="w-full text-sm text-gray-800 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-semibold tracking-wider">
        <tr>
          <th class="px-6 py-4 text-left">ID</th>
          <th class="px-6 py-4 text-left">Mahsulot</th>
          <th class="px-6 py-4 text-left">Miqdori</th>
          <th class="px-6 py-4 text-left">O'lchov</th>
          <th class="px-6 py-4 text-left">Amallar</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in orders" :key="order.id"
            class="hover:bg-gray-50 transition-all duration-200 border-t border-gray-200">
          <td class="px-6 py-4">{{ order.id }}</td>
          <td class="px-6 py-4">{{ getProductName(order.productsId) }}</td>
          <td class="px-6 py-4">{{ order.quantity }}</td>
          <td class="px-6 py-4">{{ getMeasureName(order.measureId) }}</td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <button
                  @click="editMessage(order)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors duration-200">
                Edit
              </button>
              <button
                  @click="deleteOrder(order.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors duration-200">
                Delete
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {createOrder, Measures, Orders, Product, updateOrder, WareHouse} from "../models/Product.ts";
import {onMounted, ref} from "vue";
import {ApiService} from "../service/ApiService.ts";

const isEditing = ref(false);
const products = ref<Product[]>([]);
const wareHouses = ref<WareHouse[]>([]);
const measures = ref<Measures[]>([]);
const orders = ref<Orders[]>([]);

const form = ref<createOrder>({
  productsId: 0,
  quantity: 0,
  wareHouseId: 1,
  measureId: 0
});

const update = ref<updateOrder>({
  id: 0,
  productsId: 0,
  quantity: 0,
  wareHouseId: 0,
  measureId: 0
});

const getProductName = (id: number): string => {
  const product = products.value.find(p => p.id === id);
  return product ? product.name : "Noma’lum mahsulot";
};

const getMeasureName = (id: number): string => {
  const measure = measures.value.find(m => m.id === id);
  return measure ? measure.name : "Noma’lum o‘lchov";
};

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await ApiService.updateOrder(update.value.id, {...form.value, id: update.value.id});
    } else {
      await ApiService.createOrder(form.value);
    }
    resetForm();
    await fetchAllOrders();
  } catch (error) {
    console.error(error);
  }
};

const editMessage = (order: updateOrder) => {
  update.value = {
    id: order.id,
    productsId: order.productsId,
    quantity: order.quantity,
    wareHouseId: order.wareHouseId,
    measureId: order.measureId
  };
  form.value = {
    productsId: order.productsId,
    quantity: order.quantity,
    wareHouseId: order.wareHouseId,
    measureId: order.measureId
  };
  isEditing.value = true;
};

const deleteOrder = async (id: number) => {
  if (confirm("Rostdan ham o‘chirmoqchimisiz?")) {
    await ApiService.deleteOrder(id);
    await fetchAllOrders();
  }
};

const fetchAllOrders = async () => {
  try {
    const response = await ApiService.activeOrder();
    orders.value = response.data || [];
  } catch (error) {
    console.error(error);
  }
};

const resetForm = () => {
  form.value = {
    productsId: 0,
    quantity: 0,
    wareHouseId: 0,
    measureId: 1
  };
  isEditing.value = false;
};

onMounted(async () => {
  try {
    const [p, w, m] = await Promise.all([
      ApiService.getAllProducts(),
      ApiService.getAllWarehouses(),
      ApiService.getAllMeasures()
    ]);
    products.value = p.data;
    wareHouses.value = w.data;
    measures.value = m.data;
    await fetchAllOrders();
  } catch (error) {
    console.error("Xatolik yuklashda:", error);
  }
});
</script>