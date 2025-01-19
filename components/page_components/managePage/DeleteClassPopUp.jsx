'use client'
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const DeleteClassPopUp = ({ isOpen, setIsOpen, isLoading, setIsLoading }) => {
	const router = useRouter();

	const handleDeleteClass = async () => {
		if (isLoading) return;
		setIsLoading(true);
		sessionStorage.setItem('showToast', 'true');
		router.push('/dashboard');



		setIsLoading(false);
	}

	return (<>
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<DialogDescription className="text-black">
					Are you sure you want to delete this class? This action cannot be undone.
				</DialogDescription>
				<div className="flex justify-between mt-2">
					<Button onClick={() => setIsOpen(false)} variant="outline">Cancel</Button>
					<Button onClick={handleDeleteClass} variant="destructive" className={((isLoading) ? "cursor-progress" : "")}>Delete</Button>
				</div>
			</DialogContent>
		</Dialog>
	</>)
}

export default DeleteClassPopUp
