import { Flex } from 'antd'
import ChatList from '@/components/chat-list'
import { generateChatList } from '@/mock/data'

const Dashboard = () => {
	return (
		<div>
			<Flex align="start">
				<ChatList data={generateChatList(100)} />
				<p className="w750:flex hidden">Select align :</p>
			</Flex>
		</div>
	)
}

export default Dashboard
