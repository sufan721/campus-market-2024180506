<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { createTrade } from '@/api/trade'
import { createLostFound } from '@/api/lostFound'
import { createGroupBuy } from '@/api/groupBuy'
import { createErrand } from '@/api/errand'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// ========== 发布类型 ==========
type PublishType = 'trade' | 'lostFound' | 'groupBuy' | 'errand'

const publishType = ref<PublishType>('trade')

const typeOptions = [
  { value: 'trade', label: '二手交易' },
  { value: 'lostFound', label: '失物招领' },
  { value: 'groupBuy', label: '拼单搭子' },
  { value: 'errand', label: '跑腿委托' },
] as const

// ========== 二手交易字段 ==========
const tradeForm = reactive({
  title: '',
  category: '',
  price: undefined as number | undefined,
  condition: '',
  location: '',
  image: '',
  description: '',
})

// ========== 失物招领字段 ==========
const lostFoundForm = reactive({
  title: '',
  type: 'lost' as 'lost' | 'found',
  itemName: '',
  location: '',
  eventTime: '',
  contact: userStore.currentUser?.contact || '',
  image: '',
  description: '',
})

// ========== 拼单搭子字段 ==========
const groupBuyForm = reactive({
  title: '',
  type: '',
  targetCount: undefined as number | undefined,
  location: '',
  deadline: '',
  image: '',
  description: '',
})

// ========== 跑腿委托字段 ==========
const errandForm = reactive({
  title: '',
  taskType: '',
  reward: undefined as number | undefined,
  from: '',
  to: '',
  deadline: '',
  image: '',
  description: '',
})

// ========== 表单校验规则 ==========
const tradeRules: FormRules = {
  title: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' },
  ],
  condition: [{ required: true, message: '请选择成色', trigger: 'change' }],
  location: [{ required: true, message: '请输入交易地点', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
}

const lostFoundRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  itemName: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

const groupBuyRules: FormRules = {
  title: [
    { required: true, message: '请输入拼单标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择拼单类型', trigger: 'change' }],
  targetCount: [
    { required: true, message: '请输入目标人数', trigger: 'blur' },
    { type: 'number', min: 2, message: '至少需要 2 人', trigger: 'blur' },
  ],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

const errandRules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  reward: [
    { required: true, message: '请输入报酬', trigger: 'blur' },
    { type: 'number', min: 0, message: '报酬不能为负数', trigger: 'blur' },
  ],
  from: [{ required: true, message: '请输入起点', trigger: 'blur' }],
  to: [{ required: true, message: '请输入终点', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

// 当前类型的校验规则
const currentRules = computed<FormRules>(() => {
  switch (publishType.value) {
    case 'trade': return tradeRules
    case 'lostFound': return lostFoundRules
    case 'groupBuy': return groupBuyRules
    case 'errand': return errandRules
  }
})

// 发布者展示名称
const publisherName = computed(() =>
  userStore.currentUser
    ? `${userStore.currentUser.department} ${userStore.currentUser.grade}学生`
    : ''
)

// 格式化当前时间
function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ========== 图片上传（通用） ==========
function handleImageUpload(file: any, target: { image: string }) {
  const reader = new FileReader()
  reader.onload = (e) => {
    target.image = (e.target?.result as string) || ''
  }
  reader.readAsDataURL(file.raw!)
}

// ========== 切换类型时重置表单 ==========
function onTypeChange() {
  formRef.value?.resetFields()
}

// ========== 提交 ==========
async function submitPublish() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }

  submitting.value = true

  try {
    switch (publishType.value) {
      case 'trade': {
        await createTrade({
          title: tradeForm.title,
          category: tradeForm.category,
          price: tradeForm.price!,
          condition: tradeForm.condition,
          location: tradeForm.location,
          publisher: publisherName.value,
          publishTime: now(),
          image: tradeForm.image || '',
          status: 'open',
          description: tradeForm.description,
        })
        break
      }
      case 'lostFound': {
        await createLostFound({
          title: lostFoundForm.title,
          type: lostFoundForm.type,
          itemName: lostFoundForm.itemName,
          location: lostFoundForm.location,
          eventTime: lostFoundForm.eventTime || now(),
          contact: lostFoundForm.contact,
          status: 'open',
          image: lostFoundForm.image || '',
          description: lostFoundForm.description,
        })
        break
      }
      case 'groupBuy': {
        await createGroupBuy({
          title: groupBuyForm.title,
          type: groupBuyForm.type,
          targetCount: groupBuyForm.targetCount!,
          currentCount: 1,
          deadline: groupBuyForm.deadline,
          location: groupBuyForm.location,
          publisher: publisherName.value,
          status: 'open',
          image: groupBuyForm.image || '',
          description: groupBuyForm.description,
        })
        break
      }
      case 'errand': {
        await createErrand({
          title: errandForm.title,
          taskType: errandForm.taskType,
          reward: errandForm.reward!,
          from: errandForm.from,
          to: errandForm.to,
          deadline: errandForm.deadline,
          publisher: publisherName.value,
          status: 'open',
          image: errandForm.image || '',
          description: errandForm.description,
        })
        break
      }
    }

    ElMessage.success(`「${typeOptions.find(t => t.value === publishType.value)?.label}」发布成功！`)
    formRef.value?.resetFields()
  } catch {
    ElMessage.error('发布失败，请检查 Mock 服务是否启动')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="publish-page">
    <!-- 未登录 -->
    <el-empty v-if="!userStore.isLoggedIn" description="请先登录后发布信息">
      <el-button type="primary" @click="$router.push('/profile')">前往登录</el-button>
    </el-empty>

    <template v-else>
    <div class="page-header">
      <h1>发布信息</h1>
      <p class="subtitle">
        当前身份：
        <strong>{{ userStore.currentUser?.name || '未登录' }}</strong>
        （{{ publisherName }}）
      </p>
    </div>

    <el-card shadow="never" class="form-card">
      <!-- 发布类型选择 -->
      <div class="type-selector">
        <span class="type-label">发布类型</span>
        <el-radio-group
          v-model="publishType"
          size="large"
          @change="onTypeChange"
        >
          <el-radio-button
            v-for="opt in typeOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- ===================== 二手交易表单 ===================== -->
      <el-form
        v-if="publishType === 'trade'"
        ref="formRef"
        :model="tradeForm"
        :rules="currentRules"
        label-position="top"
        size="large"
        @submit.prevent="submitPublish"
      >
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="tradeForm.title" placeholder="请输入商品名称" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-form-item label="价格 (¥)" prop="price">
              <el-input-number v-model="tradeForm.price" :min="0" :precision="2" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="分类" prop="category">
              <el-select v-model="tradeForm.category" placeholder="请选择" style="width: 100%">
                <el-option label="教材资料" value="教材资料" />
                <el-option label="数码配件" value="数码配件" />
                <el-option label="生活用品" value="生活用品" />
                <el-option label="出行工具" value="出行工具" />
                <el-option label="家用电器" value="家用电器" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="成色" prop="condition">
              <el-select v-model="tradeForm.condition" placeholder="请选择" style="width: 100%">
                <el-option label="全新" value="全新" />
                <el-option label="九成新" value="九成新" />
                <el-option label="八成新" value="八成新" />
                <el-option label="七成新" value="七成新" />
                <el-option label="六成新及以下" value="六成新及以下" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="交易地点" prop="location">
          <el-input v-model="tradeForm.location" placeholder="如：东区宿舍、图书馆门口" clearable />
        </el-form-item>

        <el-form-item label="商品照片（可选）" prop="image">
          <div class="upload-wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleImageUpload(f, tradeForm)"
              accept="image/*"
              drag
            >
              <div v-if="tradeForm.image" class="upload-preview">
                <img :src="tradeForm.image" alt="预览" />
                <div class="upload-mask">
                  <span>点击更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon :size="32" color="#c0c4cc"><UploadFilled /></el-icon>
                <p>将图片拖到此处，或点击上传</p>
                <p class="upload-hint">支持 jpg、png 格式</p>
              </div>
            </el-upload>
            <el-button v-if="tradeForm.image" text type="danger" size="small" @click="tradeForm.image = ''">
              移除图片
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="tradeForm.description" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请详细描述商品状况…" />
        </el-form-item>
      </el-form>

      <!-- ===================== 失物招领表单 ===================== -->
      <el-form
        v-if="publishType === 'lostFound'"
        ref="formRef"
        :model="lostFoundForm"
        :rules="currentRules"
        label-position="top"
        size="large"
        @submit.prevent="submitPublish"
      >
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="lostFoundForm.type">
            <el-radio value="lost">寻物启事</el-radio>
            <el-radio value="found">失物招领</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="lostFoundForm.title" placeholder="如：寻找黑色校园卡" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="物品名称" prop="itemName">
          <el-input v-model="lostFoundForm.itemName" placeholder="如：校园卡、雨伞" clearable />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="地点" prop="location">
              <el-input v-model="lostFoundForm.location" placeholder="如：一食堂附近" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="时间" prop="eventTime">
              <el-input v-model="lostFoundForm.eventTime" placeholder="如：2026-06-02 12:10" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="lostFoundForm.contact" placeholder="站内消息联系" clearable />
        </el-form-item>

        <el-form-item label="物品照片（可选）" prop="image">
          <div class="upload-wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleImageUpload(f, lostFoundForm)"
              accept="image/*"
              drag
            >
              <div v-if="lostFoundForm.image" class="upload-preview">
                <img :src="lostFoundForm.image" alt="预览" />
                <div class="upload-mask">
                  <span>点击更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon :size="32" color="#c0c4cc"><UploadFilled /></el-icon>
                <p>将图片拖到此处，或点击上传</p>
                <p class="upload-hint">支持 jpg、png 格式</p>
              </div>
            </el-upload>
            <el-button v-if="lostFoundForm.image" text type="danger" size="small" @click="lostFoundForm.image = ''">
              移除图片
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="lostFoundForm.description" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请描述物品特征…" />
        </el-form-item>
      </el-form>

      <!-- ===================== 拼单搭子表单 ===================== -->
      <el-form
        v-if="publishType === 'groupBuy'"
        ref="formRef"
        :model="groupBuyForm"
        :rules="currentRules"
        label-position="top"
        size="large"
        @submit.prevent="submitPublish"
      >
        <el-form-item label="拼单标题" prop="title">
          <el-input v-model="groupBuyForm.title" placeholder="如：周五晚火锅拼单" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="拼单类型" prop="type">
              <el-select v-model="groupBuyForm.type" placeholder="请选择" style="width: 100%">
                <el-option label="拼餐" value="拼餐" />
                <el-option label="学习资料" value="学习资料" />
                <el-option label="运动" value="运动" />
                <el-option label="出行" value="出行" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="目标人数" prop="targetCount">
              <el-input-number v-model="groupBuyForm.targetCount" :min="2" :max="100" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="地点" prop="location">
              <el-input v-model="groupBuyForm.location" placeholder="如：学校南门" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="截止时间" prop="deadline">
              <el-input v-model="groupBuyForm.deadline" placeholder="2026-06-05 17:00" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="groupBuyForm.description" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="AA 制，人数够后统一预约。" />
        </el-form-item>

        <el-form-item label="活动照片（可选）" prop="image">
          <div class="upload-wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleImageUpload(f, groupBuyForm)"
              accept="image/*"
              drag
            >
              <div v-if="groupBuyForm.image" class="upload-preview">
                <img :src="groupBuyForm.image" alt="预览" />
                <div class="upload-mask">
                  <span>点击更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon :size="32" color="#c0c4cc"><UploadFilled /></el-icon>
                <p>将图片拖到此处，或点击上传</p>
                <p class="upload-hint">支持 jpg、png 格式</p>
              </div>
            </el-upload>
            <el-button v-if="groupBuyForm.image" text type="danger" size="small" @click="groupBuyForm.image = ''">
              移除图片
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- ===================== 跑腿委托表单 ===================== -->
      <el-form
        v-if="publishType === 'errand'"
        ref="formRef"
        :model="errandForm"
        :rules="currentRules"
        label-position="top"
        size="large"
        @submit.prevent="submitPublish"
      >
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="errandForm.title" placeholder="如：帮取快递到宿舍楼下" maxlength="50" show-word-limit clearable />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="errandForm.taskType" placeholder="请选择" style="width: 100%">
                <el-option label="取快递" value="取快递" />
                <el-option label="代买" value="代买" />
                <el-option label="代办" value="代办" />
                <el-option label="搬运" value="搬运" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="报酬 (¥)" prop="reward">
              <el-input-number v-model="errandForm.reward" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="起点" prop="from">
              <el-input v-model="errandForm.from" placeholder="如：菜鸟驿站" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="终点" prop="to">
              <el-input v-model="errandForm.to" placeholder="如：西区 5 栋" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="截止时间" prop="deadline">
          <el-input v-model="errandForm.deadline" placeholder="2026-06-03 19:00" clearable />
        </el-form-item>

        <el-form-item label="任务照片（可选）" prop="image">
          <div class="upload-wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleImageUpload(f, errandForm)"
              accept="image/*"
              drag
            >
              <div v-if="errandForm.image" class="upload-preview">
                <img :src="errandForm.image" alt="预览" />
                <div class="upload-mask">
                  <span>点击更换图片</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon :size="32" color="#c0c4cc"><UploadFilled /></el-icon>
                <p>将图片拖到此处，或点击上传</p>
                <p class="upload-hint">支持 jpg、png 格式</p>
              </div>
            </el-upload>
            <el-button v-if="errandForm.image" text type="danger" size="small" @click="errandForm.image = ''">
              移除图片
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input v-model="errandForm.description" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请描述任务具体要求…" />
        </el-form-item>
      </el-form>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="submitPublish"
          style="width: 100%"
        >
          {{ submitting ? '发布中…' : '发布' }}
        </el-button>
      </el-form-item>
    </el-card>
    </template>
  </div>
</template>

<style scoped>
.publish-page {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.subtitle strong {
  color: var(--color-text-link);
}

.form-card {
  border-radius: var(--border-radius-card);
}

.form-card :deep(.el-card__body) {
  padding: 28px 32px;
}

/* 类型选择器 */
.type-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.type-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

/* ========== 图片上传 ========== */
.upload-wrap {
  width: 100%;
}

.upload-placeholder {
  padding: 24px 16px;
  text-align: center;
}

.upload-placeholder p {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.upload-hint {
  font-size: 12px !important;
  color: var(--color-text-placeholder) !important;
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-preview:hover .upload-mask {
  opacity: 1;
}

.upload-mask span {
  color: #fff;
  font-size: 13px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .form-card :deep(.el-card__body) {
    padding: 18px 14px;
  }

  .type-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 12px;
  }
}
</style>
