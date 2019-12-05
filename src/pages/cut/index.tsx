import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { apiHost } from '@api/request'

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
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  }
}))
class Index extends Component {

    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '我的优惠券'
  }

  state = {
    tabIndex: 0,
    orderList: [1],
    opList: [1],
    listData: [],
    appointlist: []
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.getMyOrder()
   }

  componentDidHide () { }

  getMyOrder () {
    Taro.showLoading();
    Taro.request({
      url: apiHost +'/getCutList?openid=' + Taro.getStorageSync('openId') + "&model=0",
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      }
    }).then(res => {
      Taro.hideLoading()
      console.log(res)
      this.setState({
        listData: res.data.msg,
        loading: true
      })
    })
  }

  getMyAppoint () {
    Taro.showLoading();
    var that = this;
    //获取我的预约
    Taro.request({
      url: apiHost +'/getMyOrderList?openid=' + Taro.getStorageSync('openId') + "&model=1",
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        Taro.hideLoading();
        console.log(res)
        that.setState({
          listData: res.data.data,
          loading: true
        })
      }
    })
  }

  changeTab (e) {
    var index = e.currentTarget.dataset.index
    this.setState({
      tabIndex: index,
    })
    if (index == 0) {
      this.getMyOrder()
    } else {
      this.getMyAppoint()
    }
  }

  golist () {
    Taro.navigateTo({
      url: '../../list/list'
    })
  }
  goAppoint () {
    Taro.navigateTo({
      url: '../../appoint/appoint'
    })
  }
  //进入详情
  goDetail(e) {
    var orderId = e.currentTarget.dataset.orderid
    Taro.navigateTo({
      url: '../detail/detail?orderId=' + orderId
    })
  }

  call(e) {
    Taro.sendSocketMessage({
      data: JSON.stringify({
        "nu": e.target.dataset.nu,
        "type": "call"
      })
    })
  }

  render () {
    const { listData } = this.state
    return (
      <View className="orderList">
        {
          listData.length === 0 &&
          <View style="text-align:center;font-size:14px;color:#333;margin-top:10px">您暂时没有可用的优惠券哦～</View>
        }
        {
          listData.map((item, index) => {
            return (
              <View className={`${item.status === 0 ? 'card unuse' : 'card isUse'}`} id={`a${index}`} key={index}>
                <View className="info">
                  <View className="detail">
                    <View className="top-r">
                      <Text className="sl">
                        { item.detail.cut } 元立减券
                      </Text>
                      { item.detail.typeDes }
                    </View>
                    <View style="padding:5px;font-size:24px;">
                      有效期至： { item.detail.endDate }
                    </View>
                    <View>
                      本券不与单品优惠券通用
                    </View>
                    <Image className="logo-re" src="../../assets/images/logo-list.png"></Image>
                  </View>
                  {
                    item.status === 1 &&
                    <View className="st">
                      已使用
                    </View>
                  }
                </View>
              </View>
            )
          })
        }
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
