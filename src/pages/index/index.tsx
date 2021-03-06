import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image, Swiper, SwiperItem, ScrollView, PickerView, PickerViewColumn } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import IconFont from '@components/iconfont'

import { add, minus, asyncAdd } from '../../actions/counter'
import { set as userSet } from '../../actions/user'
import { set as pageSet } from '../../actions/page'
import { apiHost, Api } from '@api/request'
import { get as globalGet, set as globalSet } from '@store/global'
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
  user: User,
  page: {
    openTime: number,
    closeTime: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any,
  userSet: (val: object) => any,
  pageSet: (val: object) => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter, user, page }) => ({
  counter, user, page
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
  userSet (val: object) {
    dispatch(userSet(val))
  },
  pageSet (val: object) {
    dispatch(pageSet(val))
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
    navigationBarTitleText: '敏萓美食'
  }

  state = {
    //轮播图
    imgUrls: [
      "cloud://leeapps-b71pw.6c65-leeapps-b71pw-1255591994/93616-59a6322460ae0.jpg",
      "cloud://leeapps-b71pw.6c65-leeapps-b71pw-1255591994/93616-59a6322460ae0.jpg",
      "cloud://leeapps-b71pw.6c65-leeapps-b71pw-1255591994/93616-59a6322460ae0.jpg",
      "cloud://leeapps-b71pw.6c65-leeapps-b71pw-1255591994/93616-59a6322460ae0.jpg",
    ],
    logo:'../../assets/images/logo.png',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    time:"15:20",
    showAdStatus: false,
    showSleepStatus:false,
    showAppointStatus: false,
    adleft: "7%",
    timeRange: [],
    reList: [],
    isiphonex:false,
    isAppoint:false,
    sleep:false,
    appointTime:"",
    appointValue: [12, 21]
  }

  animation: Taro.Animation

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount  () {
    const height = Taro.getSystemInfoSync().windowHeight;
    if (height > 700){
      this.setState({
        isiphonex:true
      })
      this.props.pageSet({isIphonex: true})
    }
    this.auth()
  }

  async auth () {
    Taro.getStorage({
      key: 'auth'
    }).then((res: any) => {
      this.props.userSet(res.data)
      this.checkUse(res.data.openid)
    }).catch(err => {
      console.log(err)
      Taro.login().then(res => {
        console.log(res)
        Taro.request({
          url: `${Api}auth?js_code=${res.code}`
        }).then(res => res.data)
          .then(res => {
            if (res.openid) {
              Taro.setStorageSync('auth', res)
              this.props.userSet(res)
              this.checkUse(res.openid)
            }
          })
      })
    })
  }

  async checkUse (openid) {
    let ret = await Taro.request({
      url: `${Api}user/find?openid=${openid}`
    })
    if (ret.data && ret.data.data) {
      this.props.userSet({
        isLogin: true,
        uid: ret.data.data.id
      })
    }
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.getShopTime()
   }

  componentDidHide () { }
  //自助点单
  golist () {
    if(this.state.sleep){
        this.setState({
          showSleepStatus:true
        })
    }else{
      Taro.navigateTo({
        url: '/pages/list/index?model=0'
      })
    }
  }
  getShopTime () {
    const { openTime, closeTime } = this.props.page
    const timeRange: string[] = [];
    const d = new Date();
    let now_h = d.getHours()
    let now_m = d.getMinutes()
    console.log(now_h)
    //当处于9:00以前 22:00以后时
    if (now_h < openTime || now_h > closeTime-1) {
      // that.setState({
      //   sleep:true
      // })
      //从9点开始每隔10分钟
      for (let i = openTime; i < closeTime; i++) {
        for (let j = 0; j < 60; j = j + 10) {
          if (j == 0) {
            timeRange.push(i + ":00")
          } else {
            timeRange.push(i + ":" + j)
          }
        }
      }
    } else {
      //处于营业时间则需提前半小时
      console.log(now_m)
      now_m = parseInt(String(now_m / 10)) + 3
      console.log(now_m)
      if (now_m > 5) {
        now_m = (now_m - 6) * 10
        console.log(now_m)
        now_h += 1
      } else {
        now_m = now_m * 10
      }
      for (let i = now_h; i < closeTime; i++) {
        for (let j = now_m; j < 60; j = j + 10) {
          if (j == 0) {
            timeRange.push(i + ":00")
          } else {
            timeRange.push(i + ":" + j)
          }
        }
      }
    }
    this.setState({
      timeRange
    })
  }
  async goOrderlist () {
    Taro.showLoading()
    let ret = await Taro.request({
      url: `${Api}user/findOrder?id=${this.props.user.uid}`
    })
    if (ret.data) {
      console.log(ret.data.data)
    }
    Taro.hideLoading()
    Taro.navigateTo({
      url: '/pages/order/list'
    })
  }
  goMine () {
    Taro.navigateTo({
      url: '/pages/mine/index'
    })
  }
  letAppoint () {
    this.setState({
      isAppoint:true,
      showAppointStatus: true
    })
  }
  //获取可领的优惠券列表
  getReduction () {
    var that = this;
    Taro.showLoading()
    //获取我的订单
    Taro.request({
      url: apiHost+'/getUserCanUseReductionList?openid=' + Taro.getStorageSync('openId'),
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        let showAdStatus=false;
        let len = res.data.msg.length > 2 ? 2 : res.data.msg.length
        for (let i = 0; i < len;i++){
          console.log(res.data.msg.isR)
          if (res.data.msg[i].isR == 0) {
            showAdStatus = true
          }
        }
        that.setState({
          reList: res.data.msg,
          showAdStatus: showAdStatus,
        })
        Taro.hideLoading();
      }
    })
  }
  //领取优惠券
  getCut (e) {
    var that = this;
    var reduction = e.currentTarget.dataset.reduction
    console.log(e.currentTarget.dataset)
    //获取我的订单
    Taro.request({
      url: apiHost +'/getCut?openid=' + Taro.getStorageSync('openId') + "&reduction=" + reduction,
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        Taro.showToast({
          title: '领取成功',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
        that.getReduction();
      }
    })
  }
  powerDrawer (e) {
    var type= e.currentTarget.dataset.type
    var currentStatu = e.currentTarget.dataset.statu;
    console.log(currentStatu)
    if (type==2){
      Taro.showToast({
        title: '领取成功',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
    }
    this.util(currentStatu)
  }
  bindPickerChange (e) {
    const val = e.detail.value[0]
    console.log(val)
    console.log('picker发送选择改变，携带值为', this.state.timeRange[val])
    this.setState({
      appointTime: this.state.timeRange[val]
    })
    // this.goAppoint(this.state.array[e.detail.value])
  }
  closeAP () {
    this.setState({
      isAppoint:false,
      showAppointStatus:false
    })
  }
  //预约点单
  goAppoint (time) {
    Taro.navigateTo({
      url: '/pages/list/index?model=1&appointTime=' + this.state.appointTime
    })
  }
  util (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例
    var animation = Taro.createAnimation({
      duration: 200,  //动画时长
      timingFunction: "linear", //线性
      delay: 0  //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;

    // 第3步：执行第一组动画
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setState({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setState({
        animationData: animation
      })

      //关闭
      if (currentStatu == "close") {
        this.setState(
          {
            showAdStatus: false
          },
        );
      }
      if (currentStatu == "close2") {
        this.setState(
          {
            showSleepStatus: false
          },
        );
      }
      if (currentStatu == "close3") {
        this.setState(
          {
            isAppoint: false,
            showAppointStatus: false
          },
        );
      }
    }.bind(this), 200)

    // 显示
    if (currentStatu == "open") {
      this.setState(
        {
          showAdStatus: true
        }
      );
    }
  }

  render () {
    const { indicatorDots, autoplay, interval, duration, imgUrls, isiphonex, reList, timeRange, adleft, showSleepStatus, showAdStatus, showAppointStatus, isAppoint, appointValue } = this.state
    return (
      <View className='index'>
        <View className='topTitle'>
          <View className='top'>
            <IconFont name="meishi" size={160}></IconFont>
          </View>
          <View className='mine' onClick={this.goMine}>
            <IconFont name="mifan1" size={60}></IconFont>
          </View>
        </View>

        {/* 顶部轮播图 */}
        <Swiper className={`${isiphonex?'isInphoneX':'isInphone'}`} circular indicatorDots={indicatorDots} autoplay={autoplay} interval={interval} duration={duration}>
          {
            imgUrls.map((item, index) => <SwiperItem key={index}><Image src={item} className={`slide-image ${isiphonex?'isInphoneX':'isInphone'}`}></Image></SwiperItem>)
          }
        </Swiper>

        <View className={`oplist ${isiphonex ? "op-iphoenx"  :""}`}>
          <View className='oplist-item op-border' onClick={this.golist}>
            <View className='img'>
              <IconFont name="mifan" size={60}></IconFont>
            </View>
            <View className='name'>
              <Text>自助点餐</Text>
            </View>
            <Text className='a'>点击进入</Text>
          </View>
          <View className='oplist-item op-border' onClick={this.letAppoint}>
            <View className='img'>
              <IconFont name="shizhong1" size={60}></IconFont>
            </View>
            <View className='name'>
              <Text>预约取餐</Text>
            </View>
            <Text className='a'>点击进入</Text>
          </View>
          <View className='oplist-item' onClick={this.goOrderlist}>
            <View className='img'>
              <IconFont name="tubiaozhizuomoban" size={60}></IconFont>
            </View>
            <View className='name'>
              <Text>订单列表</Text>
            </View>
            <Text className='a'>点击进入</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        {/* <View className='btn-bar'>
          <Image src={logo} className='logo' />
          <View className='btn-block' style='padding-top: 80px;' onClick={this.golist}>
            <Button className="btn_op1">
              <Text className="iconfont icon-wode" style="padding-right:10px"></Text>自助点单</Button>
          </View>
          <View className='btn-block' style=' padding-top: 30px; ' >
            <Button className="btn_op2">
              <Text className="iconfont icon-dingdan" style="padding-right:10px"></Text>预约点单</Button>
          </View>
        </View> */}

        {/* 中部广告 */}
        {/* <View className="ad-box">
          <Image src={require('../../assets/images/2-1.jpg')} className="image_ad"></Image>
        </View> */}

        {/* 底部横向滑动box */}
        {/* <View className='bottom-box'>
          <ScrollView scrollX={true} className="scroll-box">
            <View className='slide-inline-box'>
              <Image src={require('../../assets/images/bottom_1.png')} className='bottom-image'></Image>
            </View>
            <View className='slide-inline-box'>
              <Image src={require('../../assets/images/bottom_2.png')} className='bottom-image'></Image>
            </View>
            <View className='slide-inline-box'>
              <Image src={require('../../assets/images/bottom_3.png')} className='bottom-image'></Image>
            </View>
          </ScrollView>
        </View> */}

        {
          showSleepStatus &&
          <View className="drawer_screen" data-type='1' onClick={this.powerDrawer} data-statu="close2"></View>
        }
        {
          showSleepStatus &&
          <View className="sleep">
            <Image src={require('../../assets/images/sleep.png')}></Image>
          </View>
        }

        {/* 优惠券领取弹窗 */}
        {/* {
          showAdStatus &&
          <View className="drawer_screen" data-type='1' onClick={this.powerDrawer} data-statu="close"></View>
        } */}
        {/* {
          showAdStatus &&
          <Image  className='logor' src={require('../../assets/images/logor.png')}></Image>
        } */}
        {
          showAdStatus &&
          <View className="drawer_box_ad" style={{left: `${adleft}`}}>
            {
              reList[0].isR === 0 &&
              <View className="drawer_content_ad">
                <View className='reduction'>
                  <View className='money'>
                    {reList[0].cut}<Text>元</Text>
                  </View>
                  <View className='content'>
                    <View className='desc'>
                      <Text>{reList[0].typeDes}</Text>
                    </View>
                    <View className="date">
                      有效期至：{reList[0].endDate}
                    </View>
                    <View className="note">本券不与单品优惠券通用</View>
                  </View>
                  <View className='btn'>
                    <Text className="btn-ok" data-reduction={reList[0].id} onClick={this.getCut}>领取</Text>
                    <Text className="btn-ok">已领取</Text>
                  </View>
                </View>
              </View>
            }
            {
              reList[1].isR === 0 &&
              <View className="drawer_content_ad">
                <View className='reduction'>
                  <View className='money'>
                    {reList[1].cut}<Text>元</Text>
                  </View>
                  <View className='content'>
                    <View className='desc'>
                      <Text>{reList[1].typeDes}</Text>
                    </View>
                    <View className="date">
                      有效期至：{reList[1].endDate}
                    </View>
                    <View className="note">
                      本券不与满减优惠券通用
                    </View>
                  </View>
                  <View className='btn'>
                    <Text className="btn-ok" data-reduction={reList[1].id} onClick={this.getCut}>领取</Text>
                    <Text className="btn-ok">已领取</Text>
                  </View>
                </View>
              </View>
            }
          <View className="btn" data-type='2' onClick={this.powerDrawer} data-statu="close">
            <Text className="btn-ok">一键领取</Text>
          </View>
          <View className="reduction-note">
            点击领取后，可在小程序内，“我的” －“我的优惠券”中查看
          </View>
        </View>
        }

        {
          showAppointStatus &&
          <View className="drawer_screen" data-type='1' onClick={this.powerDrawer} data-statu="close3"></View>
        }
        {
          isAppoint &&
          <View style='position:absolute;bottom:0px;width:100%;z-index:9999'>
          <View className='timepick'>
            <View style='color:#999' onClick={this.closeAP}>取消</View>
            请选择预约取餐时间
            <View onClick={this.goAppoint}>确定</View>
          </View>
          <PickerView indicatorStyle="height: 50px;text-align:center" style="width: 100%; height: 300px;background:white" value={appointValue} onChange={this.bindPickerChange}>
            <PickerViewColumn>
              {
                timeRange.map((item, index) => <View key={index} style="line-height: 50px;text-align:center">{item}</View>)
              }
            </PickerViewColumn>
          </PickerView>
        </View>

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
