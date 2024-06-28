import React from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const AddNewStudent = () => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numClasses">Classes Balance</Label>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline"
                                onClick={() => setNumClasses(Math.max(0, numClasses - 1))}>
                                -
                            </Button>
                            <Input
                                id="numClasses"
                                type="number"
                                value={numClasses}
                                onChange={(e) => setNumClasses(Number(e.target.value))}
                                min={0}
                                className="w-16 text-center"
                            />
                            <Button type="button" variant="outline"
                                onClick={() => setNumClasses(numClasses + 1)}>
                                +
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleNewStudentSubmit}
                            className={`${isCreatingUser ? "cursor-progress" : ""}`}>Submit</Button>
                        <div>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewStudent