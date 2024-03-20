import { Navbar } from 'framework7-react'
import useMessageStore from '@/stores/new_message'

const MessageHeader = () => {
	const messageStore = useMessageStore()

	return (
		<div className="min-h-12 bg-bgPrimary sticky top-0 z-50">
			<Navbar
				title={messageStore?.receiverInfo?.dialog_name}
				subtitle="[在线]"
				backLink
				outline={false}
				className="coss_message_navbar"
			></Navbar>
		</div>
	)
}

export default MessageHeader