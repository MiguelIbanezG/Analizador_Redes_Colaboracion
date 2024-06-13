import { Component } from "@angular/core";
import { HomeService } from "./services/home.service";
import { TranslateService } from "@ngx-translate/core";
import { lenguajes } from "./Common/Languages";
import { LanguageService } from "./services/language.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  constructor(
    private homeService: HomeService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    let lenguajeNavegador = window.navigator.language;
    this.translate.addLangs([lenguajes.es.toString(), lenguajes.en.toString()]);
    this.translate.setDefaultLang("es");
    if (lenguajeNavegador.toString().indexOf("en") !== -1) {
      this.translate.use(lenguajes.en.toString());
    } else {
      this.translate.use(lenguajes.es.toString());
    }
  }

  activeLinkStatistics = true;
  activeLinkNetwork = true;

  ngOnInit() {
    this.homeService.activeLinkStatistics$.subscribe((activeLinkStatistics) => {
      this.activeLinkStatistics = activeLinkStatistics;
    });

    this.homeService.activeLinkNetwork$.subscribe((activeLinkNetwork) => {
      this.activeLinkNetwork = activeLinkNetwork;
    });
  }

  selectLanguage(selectLenguage: string) {
    this.translate.use(selectLenguage.valueOf());
    this.languageService.emitLanguageChange(selectLenguage.valueOf());
  }
}
