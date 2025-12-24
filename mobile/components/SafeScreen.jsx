import { View} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {COLORS} from '@/constants/colors'

const SafeScreen = ({children}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top,backgroundColor: COLORS.background, flex: 1, paddingBottom: insets.bottom }}>
      {children}
    </View>
  )
}

export default SafeScreen