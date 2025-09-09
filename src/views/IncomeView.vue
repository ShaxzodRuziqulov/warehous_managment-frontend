<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="bg-white shadow-xl rounded-2xl p-6 transition-all duration-300 border border-gray-100">
      <form @submit.prevent="handleSubmit">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">
          Yangi kirib kelgan mahsulotlar
        </h2>

        <label class="block text-gray-700 font-medium mb-1">Mahsulot nomi</label>
        <select v-model="form.productsId"
                required
                class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">
          <option disabled>Mahsulotni tanlang</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
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
        <label
            class="block text-gray-700 font-medium mb-1">Miqdori</label>
        <input
            v-model="form.quantity"
            type="number"
            required
            placeholder="Miqdori"
            class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">

        <label class="block text-gray-700 font-medium mb-1">O'lchov birligi</label>
        <select v-model="form.measureId"
                required
                class="border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 w-full mb-4 placeholder-gray-400 transition-all duration-200">
          <option disabled>O'lchov birligini tanlang</option>
          <option
              v-for="measure in measures" :key="measure.id" :value="measure.id">
            {{ measure.name }}
          </option>

        </select>

        <label
            class="block text-gray-700 font-medium mb-1">Mahsulot narxi</label>
        <div class="flex gap-4 mb-4">
          <input
              v-model="form.price"
              type="number"
              required
              placeholder="Narxi"
              class="flex-1 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none rounded-lg p-3 placeholder-gray-400 transition-all duration-200">
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

    <div v-if="incomes.length" class="relative overflow-x-auto mt-8">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Mahsulotlar ro'yxati</h2>

      <table
          class="w-full text-sm overflow-x-auto text-gray-800 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-semibold tracking-wider">
        <tr>
          <th class="px-6 py-4 text-left">ID</th>
          <th class="px-6 py-4 text-left">Mahsulot</th>
          <th class="px-6 py-4 text-left">Narxi</th>
          <th class="px-6 py-4 text-left">Miqdori</th>
          <th class="px-6 py-4 text-left">O‘lchov</th>
          <th class="px-6 py-4 text-left">Sana</th>
          <th class="px-6 py-4 text-left">Amallar</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="income in incomes"
            :key="income.id"
            class="hover:bg-gray-50 transition-all duration-200 border-t border-gray-200"
        >
          <td class="px-6 py-4 font-medium">{{ income.id }}</td>
          <td class="px-6 py-4">{{ getProductName(income.productsId) }}</td>
          <td class="px-6 py-4">{{ income.price.toLocaleString() }} so'm</td>
          <td class="px-6 py-4">{{ income.quantity }}</td>
          <td class="px-6 py-4">{{ getMeasureName(income.measureId) }}</td>
          <td class="px-6 py-4">{{ formDate(income.createdAt) }}</td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <button
                  @click="editMessage(income)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors duration-200"
              >
                Edit
              </button>
              <button
                  @click="deleteIncome(income.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors duration-200"
              >
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
import {onMounted, ref} from "vue";
import type {createIncome, Income, Measures, Product, updateIncome, WareHouse} from "../models/Product.ts";
import {ApiService} from "../service/ApiService.ts";

const measures = ref<Measures[]>([])
const products = ref<Product[]>([])
const wareHouses = ref<WareHouse[]>([])
const incomes = ref<Income[]>([])
const isEditing = ref(false)

const form = ref<createIncome>({
  measureId: 0,
  price: 0,
  productsId: 0,
  quantity: 0,
  wareHouseId: 1
})
const update = ref<updateIncome>({
  id: 0,
  measureId: 0,
  price: 0,
  productsId: 0,
  quantity: 0,
  wareHouseId: 0
})
const loadProducts = async () => {
  try {
    const response = await ApiService.getAllProducts()
    console.log('response', response)
    products.value = response.data
  } catch (error) {
    console.log(error)
  }
}

const loadMeasures = async () => {
  try {
    const response = await ApiService.getAllMeasures()
    measures.value = response.data
  } catch (error) {
    console.log(error)
  }
}

const loadWareHouses = async () => {
  try {
    const response = await ApiService.getAllWarehouses()
    wareHouses.value = response.data
  } catch (error) {
    console.log(error)
  }
}

const loadIncome = async () => {
  try {
    const response = await ApiService.activeIncome()
    incomes.value = response.data
  } catch (error) {
    console.log(error)
  }
}


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
      await ApiService.updateIncome(update.value.id, {
        ...form.value, id: update.value.id
      })
    } else {
      await ApiService.createIncome(form.value)
    }
    resetForm()
    await loadIncome()
  } catch (error) {
    console.log(error);
  }
}

const editMessage = (income: updateIncome) => {
  update.value = {
    id: income.id,
    measureId: income.measureId,
    price: income.price,
    productsId: income.productsId,
    quantity: income.quantity,
    wareHouseId: income.wareHouseId
  }
  form.value = {
    measureId: income.measureId,
    price: income.price,
    productsId: income.productsId,
    quantity: income.quantity,
    wareHouseId: income.wareHouseId
  }
  isEditing.value = true
}

const deleteIncome = async (id: number) => {
  if (confirm("Are you sure?")) {
    await ApiService.deleteIncome(id)
    await loadIncome()
  }
}

const resetForm = () => {
  form.value = {
    measureId: 0,
    price: 0,
    productsId: 0,
    quantity: 0,
    wareHouseId: 1
  }
  isEditing.value = false
}
const formDate = (date: Date | string): string => {
  const metadata = new Date(date);
  return metadata.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
onMounted(() => {
  loadMeasures()
  loadProducts()
  loadWareHouses()
  loadIncome()
})
</script>
