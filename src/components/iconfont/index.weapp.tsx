/* tslint:disable */
/* eslint-disable */

import Taro, { FunctionComponent } from '@tarojs/taro';

interface Props {
  name: 'plus' | 'mifan' | 'shizhong' | 'dingcan' | 'ziyuan' | 'diancan' | 'shizhong1' | 'chufangyongpin' | 'mifan1' | 'jiahao' | 'dingcan1' | 'touxiang' | 'diancanma' | 'fan' | 'tubiaozhizuomoban' | 'meishi';
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = (props) => {
  const { name, size, color } = props;

  // @ts-ignore
  return <iconfont name={name} size={parseFloat(Taro.pxTransform(size))} color={color} />;
};

IconFont.defaultProps = {
  size: 18,
};

IconFont.config = {
  usingComponents: {
    iconfont: './weapp/weapp',
  },
};

export default IconFont;
