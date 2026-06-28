<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  price: undefined as number | undefined,
  category: '',
  desc: '',
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入商品/服务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
  desc: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
}

function submitPublish() {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success(`发布成功：${form.title}`)
      form.title = ''
      form.price = undefined
      form.category = ''
      form.desc = ''
    } else {
      ElMessage.warning('请完善表单信息')
    }
  })
}

function resetForm() {
  formRef.value?.resetFields()
}
</script>

<template>
  <div class="publish-page">
    <div class="page-header">
      <h1>发布信息</h1>
      <p class="subtitle">填写以下表单，发布你的商品或服务</p>
    </div>

    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="submitPublish"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入商品/服务名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="价格 (¥)" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                placeholder="0.00"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="二手教材" value="教材" />
                <el-option label="电子产品" value="数码" />
                <el-option label="生活用品" value="生活" />
                <el-option label="代取服务" value="服务" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            placeholder="请详细描述商品/服务信息（10-500字）"
            :rows="5"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 图片上传（装饰性） -->
        <el-form-item label="图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <el-icon><UploadFilled /></el-icon>
          </el-upload>
          <template #extra>
            <span class="upload-tip">可上传商品图片（可选，最多3张）</span>
          </template>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="submitPublish" style="width: 100%">
            发布
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.publish-page {
  max-width: 640px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.form-card {
  border-radius: 12px;
}

.upload-tip {
  color: #999;
  font-size: 12px;
}
</style>
