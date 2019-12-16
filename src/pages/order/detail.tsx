import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { apiHost } from '@api/request'

import './detail.styl'


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
    navigationBarTitleText: '订单详情'
  }
  state = {
    cartList: [],
    sumMonney: 0,
    cutMonney: 0,
    cupNumber: 0,
    cutText: '',
    orderId:"",
    cathNumber:"",
    time:"",
    model: 0,//1是预约模式  0是到店模式
    appointTime: "",
    status:1,
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidMount () {
    // Taro.setNavigationBarTitle({
    //   title: '订单详情'
    // })
    
    // this.getMyOrderDetail(options.orderId)
  }

  componentDidHide () { }

  //获取订单详情
  getMyOrderDetail = (id) => {
    var that = this;
    Taro.request({
      url: apiHost +'/getMyOrderDetail?openid=' + Taro.getStorageSync('openId')+"&orderId="+id, //获取订单详情
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data.data.status)
        that.setState({
          model: res.data.data.model,
          appointTime: res.data.data.appointTime,
          cathNumber: res.data.data.cathNumber,
          cartList: JSON.parse(res.data.data.cartList),
          sumMonney: res.data.data.sumMoney,
          cutMonney: res.data.data.cutMonney ,
          cupNumber: res.data.data.cupNumber,
          orderId: res.data.data.orderId,
          time: res.data.data.time,
          status:res.data.data.status
        })
      }
    })
  }

  render () {
    const { status, model, cartList, cathNumber, appointTime, cutText, cutMonney, sumMonney, orderId, time } = this.state
    const statuCard = status === 1 ? '制作中' : (status === 2 ? '已完成' : '已退款')
    const noteCard = status === 1 ? '饮品制作中,尽快为你服务' : (status === 2 ? '饮品制作完成，欢迎享用' : '已退款，欢迎下次再来')
    return (
      <View className='index'>
        <View className='go-center go-top-10' >
          <View className="card-box">
            <View className="card-fetch">
              <View className="card-left-bar">
                <Text>取</Text>
                <Text>餐</Text>
                <Text>号</Text>
              </View>
            </View>
            <View>
              <View className='go-top-10'>
                <Text className='number-card'>{cathNumber}</Text>
                <Text className='statu-card'> {statuCard }</Text>
              </View>
              <View className='note-card' >
                <Text>{ noteCard }</Text>
              </View>
              {
                model === 1 &&
                <View className='note-card'>
                  {
                    status === 1 &&
                    <Text>预约成功！请您于{appointTime}左右<Text style="color:#E53085">到店</Text>领取</Text>
                  }
                  {
                    status === 2 &&
                    <Text>已领取，请尽情享用</Text>
                  }
                </View>
              }
            </View>
          </View>
        </View>
        {/* 订单详情 */}
        <View className='order-info'>
          <View className='order-info-title'>订单详情</View>
          {
            cartList.map((item, index) => {
              return (
                <View className='cart-list-box'>
                  <View className='list-info'>
                    <View>{item.name}</View>
                    <View className='list-info-size'>{item.detail}</View>
                  </View>
                  <View style='width:10%;padding:10px;'>
                    <View style='font-size: 10px'>
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
            <Text>总计 </Text>
            <Text className='order-sum-number activity-color'>¥ {sumMonney}</Text>
          </View>
        </View>
        <View className='order-info'>
        {/* 本应动态请求，在此写死 */}
          <View className='order-info-title'>订单信息</View>
          <View className='order-info-title flex-display' >订单号码
            <View style='color:black;margin-left:10px'>{orderId}</View>
          </View>
          <View className='order-info-title flex-display' >订单时间
            <View className="order-info-li">{time}</View>
          </View>
        </View>
        <View style='margin-top:15px' className='go-center'>
            <label className='note-exchange'>请凭此画面至取餐柜台领取饮料</label>
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
