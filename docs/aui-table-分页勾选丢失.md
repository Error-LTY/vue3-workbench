# AUI a-table 分页勾选丢失

## 现象
切换分页后，之前勾选的行自动取消选中。

## 原因
AUI a-table 的 selection 基于 row-key 映射。分页切换时数据源整体替换，新数据的 row-key 与之前缓存不匹配，导致选中状态丢失。

## 解决方案

```vue
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
```

## 涉及文件
- `src/views/UserList.vue`
- `src/components/DataTable.vue`

---

*2026-07-15*
