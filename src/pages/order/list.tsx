import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { apiHost } from '@api/request'

import './list.styl'

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
    navigationBarTitleText: '首页'
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

  componentDidShow () { }

  componentDidHide () { }

  //获取我的订单
 getMyOrder = () => {
  Taro.showLoading();
  var that = this;
  //获取我的订单
  Taro.request({
    url: apiHost +'/getMyOrderList?openid=' + Taro.getStorageSync('openId') + "&model=0",
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

getMyAppoint = () => {
  Taro.showLoading();
  var that = this;
  //获取我的预约
  Taro.request({
    url: apiHost +'/getMyOrderList?openid=' + Taro.getStorageSync('openId') +"&model=1",
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
 changeTab = (e) => {
   var index = e.currentTarget.dataset.index
   this.setState({
     tabIndex: index,
   })
   if (index==0){
     this.getMyOrder()
   }else{
     this.getMyAppoint()
   }
 }
 golist = () => {
   Taro.navigateTo({
     url: '../../list/list?model=0'
   })
 }
 goAppoint = () => {
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
    const { tabIndex, listData } = this.state
    return (
      <View className='index'>
        <View className='go-center' style='margin-top:10px'>
          <View className='tab-box'>
            <View onClick={this.changeTab}  data-index="0" className={`go-center ${tabIndex==0?'active-color':'unactive-color'}`} style='width:50%;height:60rpx;line-height:60rpx;'>即时订单</View>
            <View onClick={this.changeTab} data-index="1" className={`go-center ${tabIndex==1?'active-color':'unactive-color'}`} style='width:50%;height:60rpx;line-height:60rpx;'>我的预约</View>
          </View>
        </View>
        {/* 订单 */}
        <View>
          <View className='go-center' style="margin-top:100px">
            <Text className="iconfont icon-dingdan dindgan-i"></Text>
          </View>
          <View className='go-center note-btn'>目前没有即时订单</View>
          <View className='go-center' style='margin-top:20px'>
            <View className='go-center down-center start-btn' onClick={this.golist}>开始点餐</View>
          </View>
        </View>
        <View className='orderList'>
          {
            listData.map((item, index) => {
              return (
                <View className="card" id={`a${index}`}>
                  <View className='info'>
                    <Image style='border-radius:5px' src='{{"http://cdn.handsomebird.xin/t"+item.cartList[0].img+".jpg?imageView2/2/w/144/h/144/format/png/q/75|watermark/2/text/5aWI6Iy25rC05bOw/font/5a6L5L2T/fontsize/240/fill/I0ZGRkZGRg==/dissolve/100/gravity/NorthEast/dx/5/dy/5|imageslim"}}'
                      lazyLoad></Image>
                    <View className='detail'>
                      <View style='padding:5px'>
                        {item.cartList[0].name}
                        <Text style="font-size:28rpx;color:#333">({item.cartList[0].detail})</Text>
                      </View>
                      {
                        item.carList.length === 1 &&
                        <View style='padding:5px;font-size:30rpx;color:#333' key="unique">({item.cartList[0].detail})</View>
                      }
                      { item.carList.length === 1 &&
                        <View style='padding:5px' key="unique"> 等{item.cupNumber}杯饮品</View>
                      }
                    </View>
                  </View>
                  {
                    tabIndex === 1 &&
                    <View style='text-align:right;margin-right:25px;color:#FF9C35;border-bottom:1px solid #e3e3e3;'>
                      <Text style='font-size:28rpx;color:#333;float:left;padding-left:10px'>预约时间:{item.appointTime}</Text>
                      <Text style='font-size:16px;'>¥ {item.sumMoney}.00</Text>
                    </View>
                  }
                  <View className='opBar'>
                    <Text data-orderId='{{item.orderId}}' onClick={this.goDetail}>查看订单详情</Text>
                  </View>
                </View>
              )
            })
          }
        </View>
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
