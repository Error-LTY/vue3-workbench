<template>
  <a-table
    :data="tableData"
    :row-key="(row) => row.id"
    @selection-change="onSelectChange"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedRows = ref([])

function onSelectChange(selection) {
  selectedRows.value = selection
}
</script>
