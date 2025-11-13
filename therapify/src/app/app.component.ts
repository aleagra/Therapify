import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';





import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Adaptador de fecha nativo
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // Genial para horarios
import { MatCardModule } from '@angular/material/card'; // Para el resumen
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'therapify';
  horariosDeEjemplo = ['10:00', '11:00', '12:00', '13:30'];
  
  minDate: Date;
// --- Propiedades ---
  citaForm: FormGroup; // <-- El formulario principal
  
  
  
  // --- Constructor ---
  // Inyectamos FormBuilder (fb) para crear el formulario fácilmente
  constructor(private fb: FormBuilder) {
    // Inicializamos el formulario aquí
    this.citaForm = this.fb.group({
      // Creamos dos controles: 'fecha' y 'hora'
      // Ambos son requeridos (Validators.required)
      fecha: [null, Validators.required],
      hora: ['', Validators.required]
    });
    this.minDate = new Date();
  }
  
  // ngOnInit se ejecuta después de que el componente se inicializa
  ngOnInit(): void {
    // (Podemos usar ngOnInit para cargar datos iniciales en el futuro,
    // como los datos del terapeuta o los horarios)
  }

  // --- Métodos (Lógica) ---

  // Este método se llamará cuando el formulario se envíe
  confirmarReserva(): void {
    if (this.citaForm.valid) {
      // Si el formulario es válido (ambos campos llenos)
      console.log('Formulario Enviado:', this.citaForm.value);
      // Aquí irá la llamada a la API
    } else {
      // Si el formulario es inválido (ej. falta la hora)
      console.log('Formulario inválido. Por favor complete todos los campos.');
    }
  }

/**
   * 2. Función [matDatepickerFilter]: Se ejecuta para CADA día 
   * en el calendario.
   * * @param d La fecha que el calendario está evaluando.
   * @returns {boolean} TRUE si la fecha es VÁLIDA, FALSE si debe deshabilitarse.
   */
  filtroDeFinesDeSemana = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    
    // Previene la selección de Sábado (6) y Domingo (0)
    return day !== 0 && day !== 6;
  }



}
