import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { set as userSet } from '../../actions/user'
import { apiHost, Api } from '@api/request'
import { User } from '../../constants/index'

import './index.styl'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  },
  user: User
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any,
  userSet: (obj: object) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter, user }) => ({
  counter, user
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  },
  userSet (obj: object) {
    dispatch(userSet(obj))
  }
}))
class Index extends Component {
  config: Config = {
    navigationBarTitleText: '我的优惠券'
  }
  componentDidMount () {
    const that = this
    Taro.getSetting({
      succes: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          Taro.getUserInfo({
            success: res => {
              console.log(res)
              const { nickName, avatarUrl } = res.userInfo
              that.props.userSet({
                nickName,
                avatarUrl
              })
            }
          })
        }
      }
    })
  }
  async getUserInfo (e) {
    const { isLogin } = this.props.user
    const user = e.detail.userInfo
    console.log(user)
    const { nickName, avatarUrl, gender } = user
    this.props.userSet({
      nickName,
      avatarUrl
    })
    if (!isLogin) {
      let ret = await Taro.request({
        url: `${Api}user/create`,
        method: 'POST',
        data: {
          name: nickName,
          phone: '',
          openid: this.props.user.openid,
          sex: gender,
          age: 0
        }
      })
      if (ret.data) {
        console.log('注册成功')
      }
    }
  }
  getPhoneNumber (e) {
    const that = this
    console.log(e)
    // this.props.userSet({
    //   phone: e.de
    // })
  }
  bitphone () {
    Taro.makePhoneCall({
      phoneNumber: '18576724218'
    })
  }
  gocut () {

  }
  goAdmin () {
    Taro.navigateTo({
      url: '/pages/admin/index'
    })
  }
  render () {
    const { nickName, avatarUrl, phone, isAdmin } = this.props.user
    return (
      <View>
        <View className="top-mode">
          {
            nickName === '' &&
            <Button className='auth' open-type="getUserInfo" onGetUserInfo={this.getUserInfo}>一键注册</Button>
          }
          <View className='userinfo'>
            <Image className="userinfo-avatar" src={avatarUrl}></Image>
            <Text style="color:white">{nickName}</Text>
            {
              isAdmin &&
              <Text style="color:white; margin-top: 20px;font-weight:bolder;" onClick={this.goAdmin}>进入管理后台</Text>
            }
          </View>
        </View>
        <View className='go-center card-box'>
          <View className='card-info'>
              <View onClick={this.gocut} className='down-center' style='height:50%;border-bottom:1px solid #E3E3E3;'>
                <Text className="iconfont icon-youhuiquan" style="color:#FF9C35"></Text>
                <Text style='font-size:15px;margin-left:15px'>我的优惠券</Text>
              </View>
              <View className='down-center' style='height:50%'> 
                <Text className="iconfont icon-shouji" style="color:#B6D9A9"></Text>
                {
                  phone !== '' &&
                  <Text style='font-size:15px;margin-left:15px'>{phone}</Text>
                }
                {
                  phone === '' &&
                  <Button size='mini'  type='primary' className='bindBtn' open-type="getPhoneNumber" onGetPhoneNumber={this.getPhoneNumber}>绑定手机号,以便接收更多优惠券的信息 </Button>
                }
              </View>
          </View>
        </View>
        <View className="go-center" style='margin-top:80px;font-size:14px;color:blue;' onClick={this.bitphone}>
            <Text style='border-bottom:1px solid blue'>客服电话：400-1118-024</Text>
        </View>
        <View className='go-center' style='margin-top:10px'>
          <Text style='font-size:12px;color:#E2E2E2'>[服务时间 周一至周五 9:00-19:00]</Text>
        </View>
      </View>
    )
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>