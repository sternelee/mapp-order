import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Textarea } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { apiHost } from '@api/request'
import IconFont from '@components/iconfont'

import './balance.styl'


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
    navigationBarTitleText: '结算'
  }

  state = {
    cartList: [],
    sumMonney: 0,
    cutid:0,
    cutMonney: 0,
    cupNumber:0,
    model: 0,//1是预约模式  0是到店模式
    appointTime: "",
    cutText:"",
    cutName:'',
    note: ''
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount () {
    // var openid = Taro.getStorageSync('openId')
    // this.webSocketInit(openid, this)
    // if (options.model == 1) {
    //   this.setData({
    //     model: 1,
    //     appointTime: options.appointTime
    //   })
    // }
    // Taro.setNavigationBarTitle({
    //   title: '订单详情'
    // })
    this.setState({
      cartList: Taro.getStorageSync('cartList'),
      sumMonney: Taro.getStorageSync('sumMonney'),
      
      cupNumber: Taro.getStorageSync('cupNumber'),
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
    var openid = Taro.getStorageSync('openId')
    // this.webSocketHandleMsg(openid, this);
    // this.getMyOrder()
   }

  componentDidHide () { }

  note = (e) => {
    this.setState({
      note: e.detail.value
    })
  }

  gopay = () => {
    // Taro.navigateTo({
    //   url: '../detail/detail'
    // })
    var that =this;
    var nonce: any = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 8));
    nonce = nonce.toString()
    var total = that.state.sumMonney - that.state.cutMonney

    Taro.request({
      url: apiHost + '/wxPay?openid=' + Taro.getStorageSync('openId'),
      method: 'POST',
      data:{
        "nonce_str": nonce+"a"+ total
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        if (res.data.code == 0) {
          var payModel = res.data.msg;
          Taro.requestPayment({
            'timeStamp': payModel.timestamp,
            'nonceStr': payModel.nonceStr,
            'package': payModel.package,
            'signType': 'MD5',
            'paySign': payModel.paySign,
            'success': function (res) {
              Taro.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              })
              console.log("dasda", payModel.package.substr(10))
              that.addOrder(payModel.out_trade_no, payModel.package.substr(10))
            },
            'fail': function (res) {
            }
          })
        }
      },
      fail: function () {

      }
    })
  }
  addOrder = (out_trade_no,packages) => {
    Taro.showLoading({
      title: '正在生成餐号',
    })
    var that = this;
    Taro.request({
      url: apiHost + '/addOrder?openid=' + Taro.getStorageSync('openId'), //下单
      method: 'POST',
      data: {
        out_trade_no: out_trade_no,
        cartList: Taro.getStorageSync('cartList'),
        sumMonney: Taro.getStorageSync('sumMonney') - that.state.cutMonney,
        cutMonney: that.state.cutMonney,
        cutText:that.state.cutText,
        cupNumber: Taro.getStorageSync('cupNumber'),
        model: this.state.model,
        appointTime: this.state.appointTime,
        packages:packages,
        note:that.state.note,
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        Taro.setStorageSync('orderInfo', res.data.msg);
        Taro.setStorageSync('cutMoney', that.state.cutMonney);
        Taro.sendSocketMessage({
          data: "newOrder"
        })
        that.useCut()
        Taro.hideLoading()
        Taro.redirectTo({
          url: '../detail/detail?orderId=' + res.data.msg.orderId
        })
      }
    })
  }
  //使用优惠券
  useCut = () => {
    Taro.showLoading();
    var that = this;
    //获取我的订单
    Taro.request({
      url: apiHost + '/useCut?id=' + that.state.cutid,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        Taro.hideLoading();
        console.log(res)
      }
    })
  }

  render () {
    const { cartList, appointTime, cutText, cutMonney, sumMonney, cupNumber, note } = this.state
    return (
      <View className='index'>
        <View className='top-bar'>
          <Text className='top-left-label'>取餐时间</Text>
          <Text className='top-right-label activity-color'>美食正在制作中，尽快为你服务</Text>
          <Text className='top-right-label activity-color'>{appointTime}</Text>
        </View>
        {/* 订单详情 */}
        <View className='order-info'>
          <View className='order-info-title'>订单详情</View>
          {
            cartList.map((item, index) => {
              return (
                <View className='cart-list-box' key="unique">
                  <View className='list-info'>
                    <View>{item.name}</View>
                    <View className='list-info-size'>{item.detail}</View>
                  </View>
                  <View style='width:10%;padding:10px;'>
                    <View style='font-size: 10px;'>
                      <View style='color:#A3A3A3'>x {item.number}</View>
                      <View>¥ {item.sum}.00</View>
                    </View>
                  </View>
                </View>
              )
            })
          }
          {
            cutMonney !== 0 &&
            <View className='order-cut'>
              <Text className='order-cut-dec'>减</Text>
              <Text className='order-cut-note'>{cutText}</Text>
              <Text className='order-cut-number activity-color'>-¥ {cutMonney}.00</Text>
            </View>
          }
          <View className='order-sum'>
            <label>总计 </label>
            <label className='order-sum-number activity-color'>¥ {sumMonney-cutMonney}</label>
          </View>
        </View>
        {/* 备注 */}
        <View className='note'>
          <Text style='font-size:13px;color:#A3A3A3'>备注</Text>
          <Textarea value={note} placeholder='默认常温，常规糖，如有口味要求，请输入备注' className='note-text' onBlur={this.note}></Textarea>
        </View>
        {/* 底部操作栏 */}
        <View className="operate-bar">
          <View className='gouwuche'>
            <View style='padding:5px;'>
              <View className='gouwuche-price' style='color:white;font-size:18px'>¥ {sumMonney-cutMonney}.00</View>
            </View>
          </View>
          <View className="submit-btn activity-color-bg" onClick={this.gopay}>
            <View className="submit-btn-label color-white">去支付</View>
            {
              cartList.length !== 0 &&
              <Text className="number-msg">{cupNumber}</Text>
            }
          </View>
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
