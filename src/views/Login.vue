<template>
  <div class="view-account">
    <div class="view-account-header"></div>
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">
          <img :src="websiteConfig.loginImage" alt="" />
        </div>
        <div class="view-account-top-desc">{{ websiteConfig.loginDesc }}</div>
      </div>
      <div class="view-account-form">
        <n-form
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
        <n-form-item path="mobile">
          <n-input v-model:value="formInline.mobile" placeholder="请输入手机号">
            <template #prefix>
              <n-icon size="18" color="#808695">
                <PhonePortraitOutline />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item path="code">
          <n-input v-model:value="formInline.code" placeholder="请输入验证码">
            <template #prefix>
              <n-icon size="18" color="#808695">
                <ChatboxEllipsesOutline />
              </n-icon>
            </template>
            <template #suffix>
              <n-button size="small" :disabled="codeSending" @click="handleSendCode">
                <template v-if="!codeSending">{{ codeButtonText }}</template>
                <template v-else>重新发送 {{ codeTime }}s</template>
              </n-button>
            </template>
          </n-input>
        </n-form-item>


          <n-form-item>
            <n-button type="primary" @click="handleSubmit" size="large" :loading="loading" block>
              登录
            </n-button>
          </n-form-item>
          <n-form-item class="default-color">
            <div class="flex view-account-other">
              <div class="flex-initial">
                <span>其它登录方式</span>
              </div>
              <div class="flex-initial mx-2">
                <a href="javascript:">
                  <n-icon size="24" color="#2d8cf0" @click="heandlerWechat">
                    <LogoWechat />
                  </n-icon>
                </a>
              </div>
            </div>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStoreWithout } from '@/store/modules/auth';
  import { useMessage } from 'naive-ui';
  import { PhonePortraitOutline, ChatboxEllipsesOutline, LogoWechat } from '@vicons/ionicons5';
  import { websiteConfig } from '@/config/website.config';
  import { sendSmsCode, smsLogin } from '@/api';

  const formRef = ref();
  const message = useMessage();
  const loading = ref(false);

  const formInline = reactive({
    mobile: '17600565959',
    code: '9999',
  });

  const rules = {
    mobile:  [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
    ],
    code: { required: true, message: '请输入验证码', trigger: 'blur' },
  };

  const authStore = useAuthStoreWithout();

  const router = useRouter();

  // 短信验证码按钮状态
  const codeButtonText = '获取验证码';
  const codeTime = ref<number>(60);// 倒计时时间

  const codeSending = ref(false); // 是否正在发送验证码
  const scene = 1;

  // 发送短信验证码
  const handleSendCode = () => {
    const { mobile } = formInline;
    
    sendSmsCode(scene, mobile)
      .then((res:any) => {
        if (res.code === 0) {
          message.success('发送成功');
          startCodeTime(); // 开始倒计时
        } else {
          message.error(res.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 开始倒计时
  const startCodeTime = () => {
    codeSending.value = true;
    codeTime.value = 60;
    const timer = setInterval(() => {
      if (codeTime.value > 0) {
        codeTime.value -= 1;
      } else {
        codeSending.value = false;
        clearInterval(timer);
      }
    }, 1000);
  };

  // 提交短信登录
  const handleSubmit = (e:any) => {
    e.preventDefault();
    formRef.value.validate(async (errors:any) => {
      if (!errors) {
        const { mobile, code } = formInline;
        message.loading('登录中...');
        loading.value = true;

        try {
          const res = await smsLogin(mobile, code);
          const { code: resCode, data} = res;
          
          if (resCode === 0) {
            authStore.setToken(data.accessToken,data.expiresTime);
            router.push({ name: 'Root' });
            message.success('登录成功');
          } else {
            message.error('登录失败，请重试');
          }
        } catch (error) {
          console.log(error);
          message.error('登录失败，请重试');
        } finally {
          loading.value = false;
        }
      } else {
        message.error('请填写完整信息，并且进行验证码校验');
      }
    });
  };


  // 暂未开放
  const heandlerWechat = () => {
    message.error('暂未开放');
  };


</script>

<style lang="less" scoped>
  .view-account {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;
    &-container {
      flex: 1;
      padding: 32px 12px;
      max-width: 384px;
      min-width: 320px;
      margin: 0 auto;
    }

    &-top {
      padding: 52px 0;
      text-align: center;

      &-desc {
        font-size: 14px;
        color: #808695;
      }
      
      &-logo {
        margin-right: 10%;
      }

      &-img {
        height: auto;
      }
    }

    &-other {
      width: 100%;
    }

    .default-color {
      color: #515a6e;

      .ant-checkbox-wrapper {
        color: #515a6e;
      }
    }
  }

  @media (min-width: 768px) {
    .view-account {
      background-image: url('../assets/login.svg');
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100%;
    }

    .page-account-container {
      padding: 32px 0 24px 0;
    }
  }
</style>