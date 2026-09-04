import { Component, ElementRef, ViewChild } from '@angular/core';
import { FinalChatService } from './service/final-chat.service';
import { FinalChatMessageViewItem } from './model/final-chat-view-model.interface';


@Component({
  selector: 'app-final-chat-page',
  standalone: false,
  templateUrl: './final-chat.component.html',
  styleUrls: ['./final-chat.component.css'],
})
export class FinalChatPageComponent {
  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLDivElement>;

  actionInputValue = '';
  selectedActionIndex: number | null = null;
  visibleMessages: FinalChatMessageViewItem[] = [];
  private scheduledMessagesCount = 0;

  constructor(private readonly finalChatService: FinalChatService){}

  get pageState(){
    return this.finalChatService.getViewModel();
  }

  ngOnInit(): void{
    this.finalChatService.initialize();
  }

  addAction(selectedOption: number): void {
    const option = this.pageState.data?.options.find((item) => item.index === selectedOption);
    this.selectedActionIndex = selectedOption;
    this.actionInputValue = option?.label ?? String(selectedOption);
  }
  
  startFinal(): void {
    this.finalChatService.StartFinal().subscribe(()=>{
      if (!this.pageState.actionErrorMessage) {
        this.showMessages(this.mensajes());
      }
    })
  }

  playTurn(selectedOption: number): void{
    this.finalChatService.playTurn(selectedOption).subscribe(() => {
      if (!this.pageState.actionErrorMessage) {
        this.clearActionInput();
        this.showMessages(this.mensajes());
      }
    });
  }

  sendAction(actionValue: string): void {
    const selectedOption = this.resolveSelectedActionIndex(actionValue);

    if (selectedOption === null || this.pageState.sending) {
      return;
    }

    this.playTurn(selectedOption);
  }

  onActionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.actionInputValue = input.value;
    this.selectedActionIndex = this.resolveSelectedActionIndex(input.value);
  }

  canSendAction(actionValue: string): boolean {
    return this.resolveSelectedActionIndex(actionValue) !== null && !this.pageState.sending;
  }

  mensajes(): FinalChatMessageViewItem[]{
    return this.finalChatService.mensajes();
  }

  strategies() {
    return this.finalChatService.strategies();
  }

  currentStrategyLabel(): string {
    const strategy = this.pageState.data?.teamStrategy;
    return strategy ? this.strategyLabel(strategy) : 'Sin estrategia';
  }

  strategyLabel(strategy: string): string {
    return this.strategies().find((item) => item.strategy === strategy)?.strategyLabel || strategy;
  }

  isSelectedStrategy(strategy: string): boolean {
    return this.pageState.data?.teamStrategy === strategy;
  }

  canChangeStrategy(): boolean {
    if (this.pageState.data && !this.pageState.data.isFinished && !this.pageState.sending) {
      return true
    }
    return false
  }

  selectStrategy(strategy: string): void {
    if (!this.canChangeStrategy()) {
      return;
    }

    this.finalChatService.SelectStrategy(strategy).subscribe(() => {
      if (!this.pageState.actionErrorMessage) {
        this.clearActionInput();
        this.showMessages(this.mensajes());
      }
    });
  }

  formations() {
    return this.finalChatService.formations();
  }

  currentFormationDescription(): string{
    const formation = this.pageState.data?.teamFormation;
    return formation ? this.formationSchema(formation) : '4-4-2';
  }

  formationSchema(formation: string): string{
    return this.formations().find((frmtn) => frmtn.formation === formation)?.formation || formation;
  }

  isSelectedFormation(formation: string): boolean {
    return this.pageState.data?.teamFormation === formation;
  }

  canChangeFormation(): boolean {
    if (this.pageState.data && !this.pageState.data.isFinished && !this.pageState.sending) {
      return true
    }
    return false
  }

  selectFormation(formation: string): void {
    if (!this.canChangeFormation()) {
      return;
    }

    this.finalChatService.SelectFormation(formation).subscribe(() => {
      if (!this.pageState.actionErrorMessage) {
        this.clearActionInput();
        this.showMessages(this.mensajes());
      }
    });
  }


  private clearActionInput(): void {
    this.actionInputValue = '';
    this.selectedActionIndex = null;
  }

  private resolveSelectedActionIndex(actionValue: string): number | null {
    const value = actionValue.trim();

    if (!value) {
      return null;
    }

    const numericValue = Number(value);
    const options = this.pageState.data?.options ?? [];
    const selectedOption = options.find((item) => {
      const sameIndex = !Number.isNaN(numericValue) && item.index === numericValue;
      const sameLabel = item.label.trim().toLowerCase() === value.toLowerCase();
      return sameIndex || sameLabel;
    });

    return selectedOption?.index ?? null;
  }

  private showMessages(messages: FinalChatMessageViewItem[]): void {
    if (messages.length < this.scheduledMessagesCount) {
      this.visibleMessages = [];
      this.scheduledMessagesCount = 0;
    }

    const pendingMessagesCount = this.scheduledMessagesCount - this.visibleMessages.length;
    const newMessages = messages.slice(this.scheduledMessagesCount);
    this.scheduledMessagesCount = messages.length;

    newMessages.forEach((message, index) => {
      setTimeout(() => {
        this.visibleMessages.push(message);
        setTimeout(() => this.scrollChat());
      }, (pendingMessagesCount + index) * 800);
    });
  }

  private scrollChat(): void {
    const chat = this.chatContainer?.nativeElement;

    if (!chat) {
      return;
    }

    chat.scrollTop = chat.scrollHeight;
  }

}
